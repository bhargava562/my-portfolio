import { runSync } from '@/lib/sync/runSync';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SYNC_SECRET = process.env.SYNC_API_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accept both env var names for compatibility
const SUPABASE_SERVICE_KEY =
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Cache-busting headers to prevent edge/CDN caching of API responses */
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

/**
 * POST /api/sync
 *
 * Distributed webhook endpoint for Supabase triggers.
 *
 * ARCHITECTURE — Lock & Dirty Flag (Thundering Herd Solution):
 *
 * 1. Every webhook instantly calls `flag_sync_needed()` to register its change.
 * 2. It then attempts `acquire_sync_lock()`.
 *    - If another instance already holds the lock → return 202 immediately.
 *      The active worker will see our flag and do the work for us.
 *    - If we acquire the lock → we become the "Active Worker".
 * 3. The Active Worker runs `runSync()` in a do…while loop:
 *    - After each run, `release_sync_lock()` atomically clears the lock AND
 *      checks if `needs_sync` was set while we were working.
 *    - If it was → loop again. If not → exit.
 *
 * This guarantees:
 * ✓ At most ONE `runSync()` executes at any time (no file write conflicts).
 * ✓ Zero data changes are lost (the dirty flag catches everything).
 * ✓ No permanent deadlocks (lock is always released in `finally`).
 */
export async function POST(request: NextRequest) {
  try {
    // ─── Auth Guard ──────────────────────────────────────────────
    if (!SYNC_SECRET) {
      console.error('[SYNC API] SYNC_API_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Sync not configured' },
        { status: 503, headers: NO_CACHE_HEADERS }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${SYNC_SECRET}`) {
      console.warn('[SYNC API] Unauthorized sync request');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    // ─── Validate Supabase Configuration ─────────────────────────
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('[SYNC API] Supabase not configured');
      return NextResponse.json(
        { success: false, error: 'Supabase sync state not available' },
        { status: 503, headers: NO_CACHE_HEADERS }
      );
    }

    // ─── Step 1: Initialize Supabase Admin Client (RLS bypass) ───
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ─── Step 2: Flag the sync as needed ─────────────────────────
    // This atomically sets needs_sync = true so the active worker
    // (us or another instance) knows there's work to do.
    console.log('[SYNC API] Flagging sync as needed...');
    const { error: flagError } = await supabase.rpc('flag_sync_needed');

    if (flagError) {
      console.error('[SYNC API] flag_sync_needed RPC failed:', flagError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to flag sync' },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // ─── Step 3: Attempt to acquire the distributed lock ─────────
    console.log('[SYNC API] Attempting to acquire sync lock...');
    const { data: lockResult, error: lockError } = await supabase.rpc('acquire_sync_lock');

    if (lockError) {
      console.error('[SYNC API] acquire_sync_lock RPC failed:', lockError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to acquire lock' },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // ─── Step 4: Handle Locked State (Thundering Herd Fix) ───────
    // Another serverless instance is already running runSync().
    // Our flag_sync_needed() ensures it will pick up our change.
    if (!lockResult?.acquired) {
      console.log('[SYNC API] Lock held by another worker. Sync queued via dirty flag.');
      return NextResponse.json(
        { message: 'Sync queued' },
        { status: 202, headers: NO_CACHE_HEADERS }
      );
    }

    // ─── Step 5: Active Worker — do…while sync loop ──────────────
    // We hold the lock. Process syncs until the dirty flag is clear.
    console.log('[SYNC API] ✓ Lock acquired. This instance is the Active Worker.');

    let needsAnotherSync = false;

    do {
      try {
        console.log('[SYNC API] Running runSync()...');
        await runSync();
        console.log('[SYNC API] ✓ runSync() completed successfully.');
      } catch (syncErr) {
        console.error(
          '[SYNC API] runSync() failed:',
          syncErr instanceof Error ? syncErr.message : syncErr
        );
        // Don't rethrow — we MUST release the lock in `finally`.
      } finally {
        // ─── Step 5a: Release lock (MUST always execute) ─────────
        // release_sync_lock atomically: clears is_syncing, clears
        // needs_sync, and returns whether needs_sync was true.
        const { data: releaseResult, error: releaseError } =
          await supabase.rpc('release_sync_lock');

        if (releaseError) {
          console.error('[SYNC API] release_sync_lock failed:', releaseError.message);
          // Break out — we can't loop safely if we can't communicate
          // with the lock table. The lock will auto-expire or be
          // cleaned up by a subsequent webhook.
          needsAnotherSync = false;
        } else {
          needsAnotherSync = releaseResult?.needs_another_sync === true;
          console.log(
            `[SYNC API] Lock released. needs_another_sync: ${needsAnotherSync}`
          );
        }

        // If we need another cycle, re-acquire the lock before looping
        if (needsAnotherSync) {
          console.log('[SYNC API] Dirty flag was set during sync. Re-acquiring lock...');
          const { data: relock, error: relockError } =
            await supabase.rpc('acquire_sync_lock');

          if (relockError || !relock?.acquired) {
            // Another instance grabbed it first — that's fine,
            // they'll handle the queued sync.
            console.log('[SYNC API] Could not re-acquire lock. Another worker took over.');
            needsAnotherSync = false;
          }
        }
      }
    } while (needsAnotherSync);

    // ─── Step 6: Return Success ──────────────────────────────────
    return NextResponse.json(
      { message: 'Sync complete' },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('[SYNC API] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
