import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// ─── Types ───────────────────────────────────────────────────

interface ColumnInfo {
  column_name: string;
  data_type: string;
}

interface TableRelation {
  parentTable: string;
  foreignKey: string;         // Column in child that references parent
  nestAs: string;             // Key name on the parent object
}

interface TableFilter {
  column: string;
  value: unknown;
  selectColumns?: string;     // Custom select instead of '*'
}

// ─── Declarative Configuration ───────────────────────────────
// Only special behaviors go here — NOT the table list itself.

/**
 * Junction/child tables that get nested into a parent instead of appearing top-level.
 * Key = child table name; value = how to nest it.
 *
 * Convention: `{parent}_skills` tables have a `{singular(parent)}_id` FK,
 * but project_collaborators uses `project_id` → `collaborators`.
 */
const RELATIONS: Record<string, TableRelation> = {
  project_collaborators:  { parentTable: 'projects',       foreignKey: 'project_id',       nestAs: 'collaborators' },
  project_skills:         { parentTable: 'projects',       foreignKey: 'project_id',       nestAs: 'skills' },
  experience_skills:      { parentTable: 'experience',     foreignKey: 'experience_id',    nestAs: 'skills' },
  certification_skills:   { parentTable: 'certifications', foreignKey: 'certification_id', nestAs: 'skills' },
  contribution_skills:    { parentTable: 'contributions',  foreignKey: 'contribution_id',  nestAs: 'skills' },
  learning_links:         { parentTable: 'learnings',      foreignKey: 'learning_id',      nestAs: 'links' },
};

/** Tables that require row-level filtering or column restriction */
const FILTERS: Record<string, TableFilter> = {
  blogs: {
    column: 'is_published',
    value: true,
    selectColumns: 'id, title, slug, excerpt, cover_image_path, published_at, reading_time, created_at',
  },
};

/** Tables that should be flattened to a single object (not an array) */
const SINGLETON_TABLES = new Set(['profile']);

// ─── Sort Column Detection ──────────────────────────────────

/** Priority order for auto-detecting the sort column from table schema */
const SORT_PRIORITY: { pattern: RegExp; ascending: boolean }[] = [
  { pattern: /^display_order$/,   ascending: true },
  { pattern: /^sort_order$/,      ascending: true },
  { pattern: /^start_date$/,      ascending: false },
  { pattern: /^event_start_date$/, ascending: false },
  { pattern: /^published_at$/,    ascending: false },
  { pattern: /^issue_date$/,      ascending: false },
  { pattern: /^award_date$/,      ascending: false },
  { pattern: /_date$/,            ascending: false },
  { pattern: /^created_at$/,      ascending: false },
];

function detectSortColumn(columns: ColumnInfo[]): { column: string; ascending: boolean } | null {
  if (columns.length === 0) return null; // No introspection data — skip ordering

  const colSet = new Set(columns.map(c => c.column_name));
  for (const rule of SORT_PRIORITY) {
    for (const colName of colSet) {
      if (rule.pattern.test(colName)) {
        return { column: colName, ascending: rule.ascending };
      }
    }
  }
  // Fallback: order by id ascending if the table has an id column
  if (colSet.has('id')) return { column: 'id', ascending: true };
  return null; // No sortable column found — skip ordering
}

// ─── Data Utilities ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanData).filter(val => val !== null && val !== undefined);
  } else if (obj !== null && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(obj).reduce((acc: any, key: string) => {
      if (key !== 'updated_at' && obj[key] !== null && obj[key] !== undefined) {
        acc[key] = cleanData(obj[key]);
      }
      return acc;
    }, {});
  }
  return obj;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj !== null && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObject(obj[key]);
    });
    return sorted;
  }
  return obj;
}

// ─── Main Sync Engine ───────────────────────────────────────

export async function runSync(): Promise<void> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("CRITICAL: Missing Supabase credentials in .env");
    throw new Error("Missing Supabase credentials");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const DATA_DIR = path.join(process.cwd(), 'public', 'data');
  const JSON_FILE = path.join(DATA_DIR, 'portfolio.json');
  const MIN_JSON_FILE = path.join(DATA_DIR, 'portfolio.min.json');
  const TMP_FILE = path.join(DATA_DIR, 'portfolio.json.tmp');
  const HASH_FILE = path.join(DATA_DIR, 'portfolio.hash');
  const LOCK_FILE = path.join(DATA_DIR, 'portfolio.lock');

  // ── Lock Acquisition ──
  try {
    const lockStats = await fs.stat(LOCK_FILE);
    if (Date.now() - lockStats.mtimeMs < 5 * 60 * 1000) {
      console.log("Sync already running, skipping...");
      return;
    }
    console.log("Stale lock found, removing...");
    await fs.unlink(LOCK_FILE).catch(() => {});
  } catch {
    // Lock doesn't exist — proceed
  }

  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.writeFile(LOCK_FILE, 'locked');
  } catch (err) {
    console.error("Failed to acquire lock:", err);
    return;
  }

  try {
    console.log("[Sync] Starting dynamic Supabase portfolio sync...");

    // ── Phase 1: Table Discovery via RPC ──
    const { data: tables, error: tableErr } = await supabase.rpc('list_public_tables');
    if (tableErr) {
      throw new Error(`Table discovery failed: ${tableErr.message}`);
    }
    if (!tables || tables.length === 0) {
      throw new Error("No tables found in public schema");
    }

    const tableNames: string[] = tables.map((t: { table_name: string }) => t.table_name);
    const childTableNames = new Set(Object.keys(RELATIONS));

    // Separate top-level tables from junction/child tables
    const topLevelTables = tableNames.filter(t => !childTableNames.has(t));
    const childTables = tableNames.filter(t => childTableNames.has(t));

    console.log(`[Sync] Discovered ${tableNames.length} tables: [${tableNames.join(', ')}]`);

    // ── Phase 2: Column Introspection (parallel) ──
    const allTablesToIntrospect = [...topLevelTables, ...childTables];
    const columnResults = await Promise.allSettled(
      allTablesToIntrospect.map(t => introspectColumns(supabase, t))
    );

    const columnMap = new Map<string, ColumnInfo[]>();
    for (let i = 0; i < allTablesToIntrospect.length; i++) {
      const result = columnResults[i];
      if (result.status === 'fulfilled' && result.value) {
        columnMap.set(allTablesToIntrospect[i], result.value);
      }
    }

    // ── Phase 3: Parallel Data Fetch ──
    const fetchResults = await Promise.allSettled(
      allTablesToIntrospect.map(tableName =>
        fetchTableDynamic(supabase, tableName, columnMap.get(tableName) || [])
      )
    );

    // Build raw data map from fetch results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawDataMap = new Map<string, any[]>();
    for (let i = 0; i < allTablesToIntrospect.length; i++) {
      const result = fetchResults[i];
      const tableName = allTablesToIntrospect[i];
      if (result.status === 'fulfilled') {
        rawDataMap.set(tableName, result.value);
      } else {
        console.warn(`[Sync] Failed to fetch ${tableName}: ${result.reason}`);
      }
    }

    // ── Phase 4: Assemble Payload ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {};

    // Add top-level tables
    for (const tableName of topLevelTables) {
      const data = rawDataMap.get(tableName);
      if (data === undefined) continue;

      if (SINGLETON_TABLES.has(tableName)) {
        payload[tableName] = data[0] || {};
      } else {
        payload[tableName] = data;
      }
    }

    // Nest child/junction tables into their parents
    for (const childTable of childTables) {
      const relation = RELATIONS[childTable];
      const childData = rawDataMap.get(childTable);
      const parentData = payload[relation.parentTable];

      if (!childData || !Array.isArray(parentData)) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload[relation.parentTable] = parentData.map((parent: any) => ({
        ...parent,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [relation.nestAs]: childData.filter((child: any) => child[relation.foreignKey] === parent.id),
      }));
    }

    const tableCount = Object.keys(payload).length;
    console.log(`[Sync] Assembled payload with ${tableCount} top-level keys`);

    // ── Phase 5: Hash Comparison & Atomic Write ──
    const sortedPayload = sortObject(payload);
    const minifiedString = JSON.stringify(sortedPayload);
    const jsonString = JSON.stringify(sortedPayload, null, 2);
    const newHash = crypto.createHash('sha256').update(minifiedString).digest('hex');

    let oldHash: string | null = null;
    try {
      oldHash = await fs.readFile(HASH_FILE, 'utf8');
    } catch { /* File might not exist */ }

    if (oldHash === newHash) {
      console.log("[Sync] Data unchanged. Skipping file writes.");
      return;
    }

    console.log(`[Sync] Changes detected. Writing to disk [${newHash.slice(0, 12)}...]`);

    // Atomic write: .tmp → rename
    await fs.writeFile(TMP_FILE, jsonString, 'utf8');
    await fs.rename(TMP_FILE, JSON_FILE);

    const TMP_MIN_FILE = path.join(DATA_DIR, 'portfolio.min.json.tmp');
    await fs.writeFile(TMP_MIN_FILE, minifiedString, 'utf8');
    await fs.rename(TMP_MIN_FILE, MIN_JSON_FILE);

    await fs.writeFile(HASH_FILE, newHash, 'utf8');
    console.log("[Sync] Sync completed successfully.");
  } catch (err) {
    console.error("[Sync] FAILED:", err);
    throw err;
  } finally {
    await fs.unlink(LOCK_FILE).catch(() => {});
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function introspectColumns(supabase: SupabaseClient, tableName: string): Promise<ColumnInfo[]> {
  const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
  if (error) {
    console.warn(`[Sync] Column introspection failed for ${tableName}: ${error.message}`);
    return [];
  }
  return data as ColumnInfo[];
}

async function fetchTableDynamic(
  supabase: SupabaseClient,
  tableName: string,
  columns: ColumnInfo[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const filter = FILTERS[tableName];
  const selectCols = filter?.selectColumns || '*';

  let query = supabase.from(tableName).select(selectCols);

  // Apply row-level filter if configured
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  // Auto-detect sort column from schema (skip if no introspection data)
  const sort = detectSortColumn(columns);
  if (sort) {
    query = query.order(sort.column, { ascending: sort.ascending });
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Fetch ${tableName} failed: ${error.message}`);
  }

  return cleanData(data || []);
}
