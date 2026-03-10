/**
 * B Terminal — O(1) Command Registry
 * Maps command names to async handler functions with constant-time lookup.
 */

import { ParsedCommand } from './commandParser';
import type { TerminalEngine } from './terminalEngine';

export interface CommandResult {
  output: string[];
  clearScreen?: boolean;
  interactiveMode?: InteractivePrompt | null;
}

export interface InteractivePrompt {
  prompts: string[];
  currentIndex: number;
  answers: Record<string, string>;
  onComplete: (answers: Record<string, string>, engine: TerminalEngine) => Promise<string[]>;
}

export type CommandHandler = (
  cmd: ParsedCommand,
  engine: TerminalEngine
) => Promise<CommandResult>;

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
