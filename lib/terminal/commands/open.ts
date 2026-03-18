/**
 * B Terminal — open command
 * Launches a desktop window by app name via context.openWindow.
 * Usage: open <app>   or   ./app.sh  (normalized by parser)
 */

import type { ParsedCommand, CommandResult, ITerminalEngine, TerminalContext } from '../types';

/** Maps friendly CLI names → ComponentRegistry IDs */
const APP_ALIASES: Record<string, string> = {
  projects:     'projects',
  project:      'projects',
  knowledge:    'learnings',
  learnings:    'learnings',
  applied:      'learnings',
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
};

export async function openCommand(
  cmd: ParsedCommand,
  engine: ITerminalEngine,
  ctx: TerminalContext,
): Promise<CommandResult> {
  const appArg = cmd.rawArgs[0]?.toLowerCase().trim();

  if (!appArg) {
    return {
      output: [
        'Usage: open <app>',
        '',
        'Available apps:',
        ...Object.keys(APP_ALIASES)
            .filter((k, i, arr) => arr.indexOf(k) === i) // dedupe
            .map(k => `  open ${k}`),
        '',
      ],
    };
  }

  const windowId = APP_ALIASES[appArg];

  if (!windowId) {
    return {
      output: [
        `bash: open: '${engine.escapeHtml(appArg)}': application not found`,
        '',
        'Run  open  (no args) to list available apps.',
      ],
    };
  }

  ctx.openWindow(windowId);

  return {
    output: [`Launching ${windowId}…`],
  };
}
