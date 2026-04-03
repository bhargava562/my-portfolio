import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ─── Types ───────────────────────────────────────────────────

interface ColumnInfo {
  column_name: string;
  data_type: string;
}

interface TableRelation {
  parentTable: string;
  foreignKey: string;
  nestAs: string;
}

interface TableFilter {
  column: string;
  value: unknown;
  selectColumns?: string;
}

interface TableFetchResult {
  table: string;
  status: 'success' | 'failed';
  data: unknown[];
  error?: string;
}

interface PortfolioData {
  [key: string]: unknown[] | Record<string, unknown>;
}

// ─── Dynamic Table Registry ──────────────────────────────────
// Requirement 1: All tables defined here as fallback/override

/**
 * Static table registry - fallback when RPC discovery fails.
 *
 * IMPORTANT: These are DATABASE TABLE NAMES, not UI folder names.
 * UI folder mappings are handled in lib/sectionMetadata.ts:
 *   - social_profiles (table) → socials (folder)
 */
const TABLE_REGISTRY: readonly string[] = [
  // Core content tables
  'projects',
  'experience',
  'education',
  'certifications',
  'skills',
  'applied_knowledge',
  'hackathons',
  'awards',
  'blogs',
  'contributions',
  // Profile & social
  'profile',
  'social_profiles',    // UI: "Socials"
  // Junction/child tables (nested into parents)
  'project_collaborators',
  'project_skills',
  'experience_skills',
  'certification_skills',
  'contribution_skills',
  'knowledge_contexts',
] as const;

// ─── Declarative Configuration ───────────────────────────────

const RELATIONS: Record<string, TableRelation> = {
  project_collaborators:  { parentTable: 'projects',          foreignKey: 'project_id',       nestAs: 'collaborators' },
  project_skills:         { parentTable: 'projects',          foreignKey: 'project_id',       nestAs: 'skills' },
  experience_skills:      { parentTable: 'experience',        foreignKey: 'experience_id',    nestAs: 'skills' },
  certification_skills:   { parentTable: 'certifications',    foreignKey: 'certification_id', nestAs: 'skills' },
  contribution_skills:    { parentTable: 'contributions',     foreignKey: 'contribution_id',  nestAs: 'skills' },
  knowledge_contexts:     { parentTable: 'applied_knowledge', foreignKey: 'knowledge_id',     nestAs: 'contexts' },
};

const FILTERS: Record<string, TableFilter> = {
  blogs: {
    column: 'is_published',
    value: true,
    selectColumns: 'id, title, slug, excerpt, cover_image_path, published_at, reading_time, created_at',
  },
};

const SINGLETON_TABLES = new Set(['profile']);

// ─── Storage Constants ──────────────────────────────────────

const STORAGE_BUCKET = 'system-cache';
const STORAGE_FILE = 'portfolio.json';
const STORAGE_HASH_FILE = 'portfolio.hash';

// ─── Sort Column Detection ──────────────────────────────────

const SORT_PRIORITY: { pattern: RegExp; ascending: boolean }[] = [
  { pattern: /^display_order$/,    ascending: true },
  { pattern: /^sort_order$/,       ascending: true },
  { pattern: /^start_date$/,       ascending: false },
  { pattern: /^event_start_date$/, ascending: false },
  { pattern: /^published_at$/,     ascending: false },
  { pattern: /^issue_date$/,       ascending: false },
  { pattern: /^award_date$/,       ascending: false },
  { pattern: /_date$/,             ascending: false },
  { pattern: /^created_at$/,       ascending: false },
];

function detectSortColumn(columns: ColumnInfo[]): { column: string; ascending: boolean } | null {
  if (columns.length === 0) return null;

  const colSet = new Set(columns.map(c => c.column_name));
  for (const rule of SORT_PRIORITY) {
    for (const colName of colSet) {
      if (rule.pattern.test(colName)) {
        return { column: colName, ascending: rule.ascending };
      }
    }
  }
  if (colSet.has('id')) return { column: 'id', ascending: true };
  return null;
}

// ─── Data Utilities ─────────────────────────────────────────

function cleanData(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(cleanData).filter(val => val !== null && val !== undefined);
  } else if (obj !== null && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    return Object.keys(record).reduce((acc: Record<string, unknown>, key: string) => {
      if (key !== 'updated_at' && record[key] !== null && record[key] !== undefined) {
        acc[key] = cleanData(record[key]);
      }
      return acc;
    }, {});
  }
  return obj;
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj !== null && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    Object.keys(record).sort().forEach(key => {
      sorted[key] = sortObject(record[key]);
    });
    return sorted;
  }
  return obj;
}

// ─── Supabase Client Factory ────────────────────────────────
// Requirement 3: RLS Bypassing with Service Role Key

function createSyncClient(): { client: SupabaseClient; usingServiceRole: boolean } {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Prefer service role key (bypasses RLS) → fallback to anon key
  const SERVICE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SUPABASE_KEY = SERVICE_KEY || ANON_KEY;

  if (!SUPABASE_URL) {
    throw new Error('[SYNC CRITICAL] Missing NEXT_PUBLIC_SUPABASE_URL in environment');
  }

  if (!SUPABASE_KEY) {
    throw new Error('[SYNC CRITICAL] Missing Supabase key. Provide NEXT_SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const usingServiceRole = Boolean(SERVICE_KEY);

  if (usingServiceRole) {
    console.log('[Sync] ✓ Using SERVICE_ROLE_KEY (RLS bypassed)');
  } else {
    console.warn('[SYNC WARNING] Using ANON_KEY - RLS policies may block data. Set NEXT_SUPABASE_SERVICE_ROLE_KEY for full access.');
  }

  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { client, usingServiceRole };
}

// ─── Table Discovery ────────────────────────────────────────

async function discoverTables(supabase: SupabaseClient): Promise<string[]> {
  // Try dynamic discovery via RPC first
  try {
    const { data: tables, error } = await supabase.rpc('list_public_tables');

    if (!error && tables && Array.isArray(tables) && tables.length > 0) {
      const discovered = tables.map((t: { table_name: string }) => t.table_name);
      console.log(`[Sync] Discovered ${discovered.length} tables via RPC`);
      return discovered;
    }
  } catch {
    console.warn('[SYNC WARNING] RPC list_public_tables failed, using static registry');
  }

  // Fallback to static registry
  console.log(`[Sync] Using static TABLE_REGISTRY (${TABLE_REGISTRY.length} tables)`);
  return [...TABLE_REGISTRY];
}

// ─── Single Table Fetch ─────────────────────────────────────
// Requirement 2: Full Column & Row Extraction with select('*')

async function fetchTable(
  supabase: SupabaseClient,
  tableName: string,
  columns: ColumnInfo[]
): Promise<TableFetchResult> {
  try {
    const filter = FILTERS[tableName];

    // REQUIREMENT 2: Always use select('*') unless filter specifies columns
    // This ensures ALL columns (including new ones like demo_video_url) are fetched
    const selectCols = filter?.selectColumns || '*';

    let query = supabase.from(tableName).select(selectCols);

    // Apply row-level filter if configured
    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    // REQUIREMENT 2: NO .limit() modifier - fetch ALL rows
    // Auto-detect sort column from schema
    const sort = detectSortColumn(columns);
    if (sort) {
      query = query.order(sort.column, { ascending: sort.ascending });
    }

    const { data, error } = await query;

    if (error) {
      return {
        table: tableName,
        status: 'failed',
        data: [],
        error: error.message,
      };
    }

    const cleaned = cleanData(data || []) as unknown[];
    return {
      table: tableName,
      status: 'success',
      data: cleaned,
    };
  } catch (err) {
    return {
      table: tableName,
      status: 'failed',
      data: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Column Introspection ───────────────────────────────────

async function introspectColumns(
  supabase: SupabaseClient,
  tableName: string
): Promise<ColumnInfo[]> {
  try {
    const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
    if (error) {
      console.warn(`[SYNC WARNING] Column introspection failed for '${tableName}': ${error.message}`);
      return [];
    }
    return (data as ColumnInfo[]) || [];
  } catch {
    return [];
  }
}

// ─── Supabase Storage Helpers ───────────────────────────────

/**
 * Read the stored hash from Supabase Storage to compare against new data.
 * Returns null if the hash file doesn't exist yet (first sync).
 */
async function readStoredHash(supabase: SupabaseClient): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_HASH_FILE);

    if (error || !data) return null;
    return await data.text();
  } catch {
    return null;
  }
}

/**
 * Upload a file to Supabase Storage, overwriting if it already exists.
 */
async function uploadToStorage(
  supabase: SupabaseClient,
  fileName: string,
  content: string,
  contentType: string
): Promise<void> {
  const { error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(fileName, content, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`[Sync] Failed to upload ${fileName} to storage: ${error.message}`);
  }
}

// ─── Main Sync Engine ───────────────────────────────────────

export async function runSync(): Promise<void> {
  // ── Create Supabase Client (with RLS bypass if service key available) ──
  const { client: supabase } = createSyncClient();

  try {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('[Sync] Starting Supabase Portfolio Sync...');
    console.log('════════════════════════════════════════════════════════════\n');

    // ── Phase 1: Table Discovery ──
    const allTables = await discoverTables(supabase);
    const childTableNames = new Set(Object.keys(RELATIONS));
    const topLevelTables = allTables.filter(t => !childTableNames.has(t));
    const childTables = allTables.filter(t => childTableNames.has(t));

    console.log(`[Sync] Top-level tables: [${topLevelTables.join(', ')}]`);
    console.log(`[Sync] Child tables: [${childTables.join(', ')}]`);

    // ── Phase 2: Column Introspection (parallel) ──
    console.log('[Sync] Introspecting table schemas...');
    const columnResults = await Promise.allSettled(
      allTables.map(t => introspectColumns(supabase, t))
    );

    const columnMap = new Map<string, ColumnInfo[]>();
    for (let i = 0; i < allTables.length; i++) {
      const result = columnResults[i];
      if (result.status === 'fulfilled') {
        columnMap.set(allTables[i], result.value);
      }
    }

    // ── Phase 3: Concurrent Data Fetch (Promise.allSettled) ──
    // REQUIREMENT 1: Use Promise.allSettled for concurrent fetching
    console.log('[Sync] Fetching all tables concurrently...\n');

    const fetchPromises = allTables.map(tableName =>
      fetchTable(supabase, tableName, columnMap.get(tableName) || [])
    );

    const fetchResults = await Promise.allSettled(fetchPromises);

    // ── Phase 4: Process Results & Build Data Map ──
    const dataMap = new Map<string, unknown[]>();
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allTables.length; i++) {
      const tableName = allTables[i];
      const settledResult = fetchResults[i];

      if (settledResult.status === 'rejected') {
        // Promise rejection (network error, etc.)
        console.error(`[SYNC WARNING] Table '${tableName}' fetch rejected: ${settledResult.reason}`);
        dataMap.set(tableName, []);
        failCount++;
        continue;
      }

      const result = settledResult.value;

      if (result.status === 'failed') {
        // Skip tables that don't exist (deleted from database)
        if (result.error?.includes('does not exist') || result.error?.includes('relation') || result.error?.includes('not found')) {
          console.warn(`[SYNC WARNING] Table '${tableName}' does not exist, skipping...`);
          failCount++;
          continue;
        }
        // Other errors: log warning and use empty array
        console.warn(`[SYNC WARNING] Table '${tableName}' failed: ${result.error}`);
        dataMap.set(tableName, []);
        failCount++;
      } else {
        const rowCount = result.data.length;
        console.log(`  ✓ ${tableName}: ${rowCount} row${rowCount !== 1 ? 's' : ''}`);
        dataMap.set(tableName, result.data);
        successCount++;
      }
    }

    console.log(`\n[Sync] Fetch complete: ${successCount} succeeded, ${failCount} failed\n`);

    // ── Phase 5: Assemble Payload ──
    const payload: PortfolioData = {};

    // Add top-level tables
    for (const tableName of topLevelTables) {
      const data = dataMap.get(tableName);
      if (data === undefined) continue;

      if (SINGLETON_TABLES.has(tableName)) {
        // Flatten singleton to object
        payload[tableName] = (data[0] as Record<string, unknown>) || {};
      } else {
        payload[tableName] = data;
      }
    }

    // Nest child/junction tables into their parents
    for (const childTable of childTables) {
      const relation = RELATIONS[childTable];
      if (!relation) continue;

      const childData = dataMap.get(childTable);
      const parentData = payload[relation.parentTable];

      if (!childData || !Array.isArray(parentData)) continue;

      payload[relation.parentTable] = parentData.map((parent) => {
        const parentRecord = parent as Record<string, unknown>;
        const parentId = parentRecord.id;
        return {
          ...parentRecord,
          [relation.nestAs]: childData.filter((child) => {
            const childRecord = child as Record<string, unknown>;
            return childRecord[relation.foreignKey] === parentId;
          }),
        };
      });
    }

    const tableCount = Object.keys(payload).length;
    console.log(`[Sync] Assembled payload with ${tableCount} top-level keys`);

    // Log row counts per key
    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value)) {
        console.log(`  • ${key}: ${value.length} items`);
      } else {
        console.log(`  • ${key}: (singleton object)`);
      }
    }

    // ── Phase 6: Hash Comparison & Upload to Supabase Storage ──
    const sortedPayload = sortObject(payload);
    const jsonString = JSON.stringify(sortedPayload);
    const newHash = crypto.createHash('sha256').update(jsonString).digest('hex');

    // Read previous hash from Supabase Storage
    const oldHash = await readStoredHash(supabase);

    if (oldHash === newHash) {
      console.log('\n[Sync] Data unchanged. Skipping upload.');
      console.log('════════════════════════════════════════════════════════════\n');
      return;
    }

    console.log(`\n[Sync] Changes detected. Uploading to Supabase Storage [hash: ${newHash.slice(0, 12)}...]`);

    // Upload portfolio JSON to Supabase Storage (overwrites existing)
    await uploadToStorage(supabase, STORAGE_FILE, jsonString, 'application/json');

    // Upload hash file for future comparison
    await uploadToStorage(supabase, STORAGE_HASH_FILE, newHash, 'text/plain');

    console.log('[Sync] Uploaded to Supabase Storage:');
    console.log(`  • ${STORAGE_BUCKET}/${STORAGE_FILE}`);
    console.log(`  • ${STORAGE_BUCKET}/${STORAGE_HASH_FILE}`);
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('[Sync] ✓ Sync completed successfully!');
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n════════════════════════════════════════════════════════════');
    console.error('[SYNC CRITICAL] Sync FAILED:', err);
    console.error('════════════════════════════════════════════════════════════\n');
    throw err;
  }
}