/**
 * B Terminal — open command
 * Launches a desktop window by app name via context.openWindow.
 * Dynamically verifies folders exist in portfolio.json + ComponentRegistry + SECTION_METADATA.
 * Usage: open <app>   or   ./app.sh  (normalized by parser)
 */

import type { ParsedCommand, CommandResult, ITerminalEngine, TerminalContext } from '../types';
import { getPortfolioData } from '@/lib/actions';
import { COMPONENT_REGISTRY } from '@/components/ComponentRegistry';
import { SECTION_METADATA } from '@/lib/sectionMetadata';

/** Maps friendly CLI names → ComponentRegistry IDs */
const APP_ALIASES: Record<string, string> = {
  projects:     'projects',
  project:      'projects',
  knowledge:    'applied_knowledge',
  learnings:    'applied_knowledge',
  applied:      'applied_knowledge',
  applied_knowledge: 'applied_knowledge',
  certifications: 'certifications',
  certs:        'certifications',
  experience:   'experience',
  exp:          'experience',
  about:        'about',
  skills:       'skills',
  education:    'education',
  hackathons:   'hackathons',
  awards:       'awards',
  blogs:        'blogs',
  socials:      'socials',
  contact:      'contact',
  terminal:     'terminal',
  contributions: 'contributions',
};

// O(1) lookup map for super-fast validation
let validAppsCache: Set<string> | null = null;

async function getValidApps(): Promise<Set<string>> {
  if (validAppsCache) return validAppsCache;

  const validApps = new Set<string>();

  // 1. Add all ComponentRegistry keys (always available)
  Object.keys(COMPONENT_REGISTRY).forEach(key => validApps.add(key));

  // 2. Add all SECTION_METADATA keys (metadata-defined sections)
  Object.keys(SECTION_METADATA).forEach(key => validApps.add(key));

  // 3. Add all portfolio.json section keys (dynamically synced from Supabase)
  try {
    const data = await getPortfolioData();
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key]) || typeof data[key] === 'object') {
        validApps.add(key);
      }
    });
  } catch (err) {
    console.error('[open] Failed to load portfolio data:', err);
  }

  validAppsCache = validApps;
  return validApps;
}

export async function openCommand(
  cmd: ParsedCommand,
  engine: ITerminalEngine,
  ctx: TerminalContext,
): Promise<CommandResult> {
  const appArg = cmd.rawArgs[0]?.toLowerCase().trim();

  if (!appArg) {
    const validApps = await getValidApps();
    const uniqueAliases = Array.from(new Set(Object.keys(APP_ALIASES)));

    return {
      output: [
        'Usage: open <app>',
        '',
        'Available apps:',
        ...uniqueAliases.map(k => `  open ${k}`),
        '',
        `Total: ${validApps.size} apps available`,
      ],
    };
  }

  // Resolve alias to windowId (e.g., 'socials' alias → 'socials' ID)
  const windowId = APP_ALIASES[appArg] || appArg;

  // Validate against all known sections
  const validApps = await getValidApps();

  if (!validApps.has(windowId)) {
    // Suggest similar apps if none found
    const suggestions = Array.from(validApps)
      .filter(app => app.includes(appArg) || appArg.includes(app.split('_')[0] || ''))
      .slice(0, 3);

    return {
      output: [
        `bash: open: '${engine.escapeHtml(appArg)}': directory not found`,
        '',
        ...(suggestions.length > 0 ? [
          'Did you mean:',
          ...suggestions.map(s => `  open ${s}`),
          '',
        ] : []),
        'Run  open  (no args) to list available apps.',
      ],
    };
  }

  ctx.openWindow(windowId);

  return {
    output: [`Launching ${windowId}…`],
  };
}