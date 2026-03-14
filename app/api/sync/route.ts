import { runSync } from '@/lib/sync/runSync';
import { NextRequest, NextResponse } from 'next/server';

const SYNC_SECRET = process.env.SYNC_API_SECRET;
const MIN_SYNC_INTERVAL_MS = 60_000; // 60 seconds
let lastSyncTime = 0;

export async function POST(request: NextRequest) {
  try {
    // Authentication guard
    if (!SYNC_SECRET) {
      console.error("SYNC_API_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Sync not configured" },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const now = Date.now();
    if (now - lastSyncTime < MIN_SYNC_INTERVAL_MS) {
      return NextResponse.json(
        { success: false, error: "Rate limited. Try again later." },
        { status: 429 }
      );
    }
    lastSyncTime = now;

    // Fire and forget (non-blocking background execution)
    runSync().catch((err) => {
      console.error("Background sync failed:", err instanceof Error ? err.message : "Unknown error");
    });

    return NextResponse.json(
      { success: true, accepted: true },
      { status: 202 }
    );
  } catch {
    console.error("Failed to trigger sync route");
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
