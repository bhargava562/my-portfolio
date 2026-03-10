/**
 * B Terminal — help command
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ParsedCommand, CommandResult, ITerminalEngine } from '../types';

export async function helpCommand(_cmd: ParsedCommand, _engine: ITerminalEngine): Promise<CommandResult> {
  return {
    output: [
      '╔══════════════════════════════════════════════════════════╗',
      '║                    B Terminal — Help                     ║',
      '╠══════════════════════════════════════════════════════════╣',
      '║                                                          ║',
      '║  help                  Show this help message             ║',
      '║  ls                   List available sections             ║',
      '║  ls --<section>       List items in a section             ║',
      '║  ls --<section> $col  Extract a column                   ║',
      '║  ls --<section> $col:val  Filter by column value         ║',
      '║  ls --date --start:YYYY-MM-DD  Date filter               ║',
      '║  ls --<section> --limit N  Limit output rows              ║',
      '║  pwd                  Print working directory             ║',
      '║  date                 Show current date                   ║',
      '║  time                 Show current time                   ║',
      '║  whoareyou            About the terminal author           ║',
      '║  msg --user           Send message (interactive)          ║',
      '║  msg --user $email:\'...\' $name:\'...\' $message:\'...\'      ║',
      '║  clear                Reset terminal                      ║',
      '║  history              Show command history                ║',
      '║  version              Show terminal version               ║',
      '║                                                          ║',
      '╚══════════════════════════════════════════════════════════╝',
    ],
  };
}
