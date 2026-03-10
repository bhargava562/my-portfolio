/**
 * B Terminal — O(1) Command Registry
 * Maps command names to async handler functions with constant-time lookup.
 */

import type { CommandHandler } from './types';

// Re-export types for convenience
export type { CommandResult, InteractivePrompt, CommandHandler, ITerminalEngine, OutputLine } from './types';

// Import individual command handlers
import { helpCommand } from './commands/help';
import { lsCommand } from './commands/ls';
import { msgCommand } from './commands/msg';
import {
  pwdCommand,
  dateCommand,
  timeCommand,
  whoareyouCommand,
  clearCommand,
  historyCommand,
  versionCommand,
  hiremeCommand,
} from './commands/misc';

/**
 * O(1) lookup registry. No if/else chains.
 */
export const COMMAND_REGISTRY: Record<string, CommandHandler> = {
  help: helpCommand,
  ls: lsCommand,
  pwd: pwdCommand,
  date: dateCommand,
  time: timeCommand,
  whoareyou: whoareyouCommand,
  msg: msgCommand,
  clear: clearCommand,
  history: historyCommand,
  version: versionCommand,
  hireme: hiremeCommand,
};

