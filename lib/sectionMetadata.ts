/**
 * Section Metadata Registry
 *
 * Single source of truth for how portfolio.json keys map to desktop items.
 * Desktop.tsx, FileExplorer, and Terminal ls all derive from the same data.
 *
 * To add a new section: just add a row to Supabase and run sync.
 * A folder icon will auto-appear on the desktop. For a custom title or
 * sort order, add an entry to SECTION_METADATA below.
 */

import type { DesktopItem, DesktopItemType } from '@/types/desktop';

// ─── Types ───────────────────────────────────────────────────

interface SectionMeta {
  id: string;             // Desktop item ID (may differ from portfolio key)
  title: string;          // Display title on the desktop
  type: DesktopItemType;  // 'file' | 'folder' | 'app'
  sortOrder: number;      // Lower = appears earlier on desktop grid
  appUrl?: string;        // For 'app' type items
}

export interface IconOverride {
  src: string;            // Image source path
  fill?: boolean;         // Use Next.js Image fill mode
  className?: string;     // Additional CSS classes
  priority?: boolean;     // Next.js Image priority loading
}

// ─── Master Lookup (O(1) by key) ─────────────────────────────

export const SECTION_METADATA: Record<string, SectionMeta> = {
  // Special items (always present, not derived from portfolio data)
  about:    { id: 'about',    title: 'About Me',   type: 'file', sortOrder: 0 },
  contact:  { id: 'contact',  title: 'Contact Me', type: 'app',  sortOrder: 12, appUrl: '/contact' },
  resume:   { id: 'resume',   title: 'Resume.pdf', type: 'file', sortOrder: 13 },
  terminal: { id: 'terminal', title: 'Terminal',    type: 'app',  sortOrder: 14 },

  // Data sections (keyed by portfolio.json key)
  applied_knowledge: { id: 'applied_knowledge', title: 'Applied Knowledge', type: 'folder', sortOrder: 1 },
  skills:          { id: 'skills',         title: 'Skills',            type: 'folder', sortOrder: 2 },
  experience:      { id: 'experience',     title: 'Experience',        type: 'folder', sortOrder: 3 },
  projects:        { id: 'projects',       title: 'Projects',          type: 'folder', sortOrder: 4 },
  education:       { id: 'education',      title: 'Education',         type: 'folder', sortOrder: 5 },
  contributions:   { id: 'contributions',  title: 'Contributions',     type: 'folder', sortOrder: 6 },
  hackathons:      { id: 'hackathons',     title: 'Hackathons',        type: 'folder', sortOrder: 7 },
  certifications:  { id: 'certifications', title: 'Certifications',    type: 'folder', sortOrder: 8 },
  awards:          { id: 'awards',         title: 'Awards',            type: 'folder', sortOrder: 9 },
  blogs:           { id: 'blogs',          title: 'Blogs',             type: 'folder', sortOrder: 10 },
  social_profiles: { id: 'socials',        title: 'Socials',           type: 'folder', sortOrder: 11 },
};

// ─── Alias Maps ──────────────────────────────────────────────

/** Portfolio.json key → desktop item ID (only entries where they differ) */
export const DATA_KEY_TO_ID: Record<string, string> = {
  social_profiles: 'socials',
};

/** Desktop item ID → portfolio.json key (reverse mapping) */
export const ID_TO_DATA_KEY: Record<string, string> = {
  socials: 'social_profiles',
};

/** Portfolio.json keys that should NOT generate desktop items */
const EXCLUDED_DATA_KEYS = new Set([
  'profile',
  'imageConfig',
  'knowledge_contexts',
  'sync_state',        // Distributed lock table
  'ui_config',         // Presentation rules
  'schema',            // Database metadata
  'schema_migrations', // Migration tracking
]);

/** Special item IDs that always appear regardless of portfolio data */
const SPECIAL_ITEM_IDS = ['about', 'resume', 'contact', 'terminal'] as const;

// ─── Icon Overrides (O(1) lookup by item ID) ─────────────────

/**
 * Items with custom image icons instead of type-based Yaru SVG icons.
 * Items not in this map get YaruFolderIcon / YaruFileIcon / YaruAppIcon by type.
 */
export const ICON_OVERRIDES: Record<string, IconOverride> = {
  terminal: { src: '/terminal.webp', className: 'drop-shadow-md' },
  contact:  { src: '/globe.svg', priority: true },
  resume:   { src: '/resume.png', fill: true, className: 'object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rounded' },
};

// ─── Default Metadata Generator ──────────────────────────────

/**
 * Generate sensible defaults for an unknown portfolio key.
 * E.g., 'volunteering' → { id: 'volunteering', title: 'Volunteering', type: 'folder', sortOrder: 50 }
 */
function getDefaultMeta(dataKey: string): SectionMeta {
  const id = DATA_KEY_TO_ID[dataKey] || dataKey;
  const title = dataKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { id, title, type: 'folder', sortOrder: 50 };
}

// ─── Static Fallback (renders while data loads / if fetch fails) ──

export const STATIC_FALLBACK_ITEMS: DesktopItem[] = [
  { id: 'about',             title: 'About Me',          type: 'file' },
  { id: 'applied_knowledge', title: 'Applied Knowledge', type: 'folder', children: [] },
  { id: 'skills',            title: 'Skills',            type: 'folder', children: [] },
  { id: 'experience',     title: 'Experience',        type: 'folder', children: [] },
  { id: 'projects',       title: 'Projects',          type: 'folder', children: [] },
  { id: 'education',      title: 'Education',         type: 'folder', children: [] },
  { id: 'contributions',  title: 'Contributions',     type: 'folder', children: [] },
  { id: 'hackathons',     title: 'Hackathons',        type: 'folder', children: [] },
  { id: 'certifications', title: 'Certifications',    type: 'folder', children: [] },
  { id: 'awards',         title: 'Awards',            type: 'folder', children: [] },
  { id: 'blogs',          title: 'Blogs',             type: 'folder', children: [] },
  { id: 'socials',        title: 'Socials',           type: 'folder', children: [] },
  { id: 'contact',        title: 'Contact Me',        type: 'app', appUrl: '/contact' },
  { id: 'resume',         title: 'Resume.pdf',        type: 'file' },
  { id: 'terminal',       title: 'Terminal',          type: 'app' },
];

// ─── Derivation Function ─────────────────────────────────────

/**
 * Derive DesktopItem[] from portfolio.json data at runtime.
 *
 * 1. Always include the 4 special items (about, resume, contact, terminal).
 * 2. For each array-valued key in portfolioData (excluding profile/imageConfig),
 *    look up SECTION_METADATA (O(1)) or generate a default.
 * 3. Sort all items by sortOrder.
 *
 * If 'volunteering' is added to Supabase and synced, it automatically appears
 * as a folder icon with title "Volunteering" — zero code changes needed.
 */
export function deriveDesktopItems(portfolioData: Record<string, unknown>): DesktopItem[] {
  const items: DesktopItem[] = [];
  const addedIds = new Set<string>();

  // 1. Special items (always present)
  for (const specialId of SPECIAL_ITEM_IDS) {
    const meta = SECTION_METADATA[specialId];
    items.push({
      id: meta.id,
      title: meta.title,
      type: meta.type,
      appUrl: meta.appUrl,
      children: meta.type === 'folder' ? [] : undefined,
      metadata: { sortOrder: meta.sortOrder },
    });
    addedIds.add(meta.id);
  }

  // 2. Data-driven items from portfolio.json keys
  for (const key of Object.keys(portfolioData)) {
    if (EXCLUDED_DATA_KEYS.has(key)) continue;
    if (!Array.isArray(portfolioData[key])) continue;

    const meta = SECTION_METADATA[key] || getDefaultMeta(key);

    // Don't duplicate if a special item already covers this ID
    if (addedIds.has(meta.id)) continue;

    items.push({
      id: meta.id,
      title: meta.title,
      type: meta.type,
      appUrl: meta.appUrl,
      children: meta.type === 'folder' ? [] : undefined,
      metadata: { sectionKey: key, sortOrder: meta.sortOrder },
    });
    addedIds.add(meta.id);
  }

  // 3. Sort by sortOrder
  items.sort((a, b) => {
    const orderA = (a.metadata?.sortOrder as number) ?? 50;
    const orderB = (b.metadata?.sortOrder as number) ?? 50;
    return orderA - orderB;
  });

  return items;
}