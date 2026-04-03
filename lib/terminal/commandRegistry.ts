/**
 * B Terminal — O(1) Command Registry
 * Maps command names to async handler functions with constant-time lookup.
 */

import type { CommandHandler } from './types';

// Re-export types for convenience
export type { CommandResult, InteractivePrompt, CommandHandler, ITerminalEngine, OutputLine, TerminalContext } from './types';

// ─── Command Imports ──────────────────────────────────────────────────────────

import { helpCommand } from './commands/help';
import { lsCommand } from './commands/ls';
import { msgCommand } from './commands/msg';
import {
  pwdCommand,
  dateCommand,
  timeCommand,
  clearCommand,
  historyCommand,
  versionCommand,
  hiremeCommand,
  echoCommand,
  whoamiCommand,
  neofetchCommand,
} from './commands/misc';
import { openCommand } from './commands/open';

// ─── Command Metadata (drives dynamic help) ───────────────────────────────────

export interface CommandMeta {
  description: string;
  usage: string;
  handler: CommandHandler;
}

export const COMMAND_MAP: Record<string, CommandMeta> = {
  help:      { description: 'Show this help menu',                          usage: 'help',                          handler: helpCommand },
  ls:        { description: 'List directory contents / portfolio sections', usage: 'ls [--<section>]',              handler: lsCommand },
  open:      { description: 'Launch a graphical desktop application',       usage: 'open <app>',                    handler: openCommand },
  echo:      { description: 'Print text to the terminal',                   usage: 'echo <text>',                   handler: echoCommand },
  whoami:    { description: 'Display current user info',                    usage: 'whoami',                        handler: whoamiCommand },
  neofetch:  { description: 'System info with ASCII art (recruiter bait)',  usage: 'neofetch',                      handler: neofetchCommand },
  pwd:       { description: 'Print working directory',                      usage: 'pwd',                           handler: pwdCommand },
  date:      { description: 'Show current date',                            usage: 'date',                          handler: dateCommand },
  time:      { description: 'Show current time',                            usage: 'time',                          handler: timeCommand },
  clear:     { description: 'Clear the terminal screen',                    usage: 'clear',                         handler: clearCommand },
  history:   { description: 'Show command history',                         usage: 'history',                       handler: historyCommand },
  msg:       { description: 'Send a message (interactive or direct)',       usage: "msg --user [$email:'...' ...]",  handler: msgCommand },
  version:   { description: 'Show terminal version',                        usage: 'version',                       handler: versionCommand },
  hireme:    { description: 'Candidate status report',                      usage: 'hireme',                        handler: hiremeCommand },
};

/**
 * O(1) lookup registry — flat map of name → handler.
 * Script aliases (./foo.sh) are resolved by the parser before reaching here.
 */
export const COMMAND_REGISTRY: Record<string, CommandHandler> = Object.fromEntries(
  Object.entries(COMMAND_MAP).map(([name, meta]) => [name, meta.handler])
);