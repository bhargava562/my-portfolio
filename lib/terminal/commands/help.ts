/**
 * B Terminal — help command
 * Dynamically generates an aligned table from COMMAND_MAP.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ParsedCommand, CommandResult, ITerminalEngine, TerminalContext } from '../types';
import { COMMAND_MAP } from '../commandRegistry';

export async function helpCommand(
  _cmd: ParsedCommand,
  _engine: ITerminalEngine,
  _ctx: TerminalContext,
): Promise<CommandResult> {
  const entries = Object.entries(COMMAND_MAP);

  // Compute column widths dynamically
  const usageWidth = Math.max(...entries.map(([, m]) => m.usage.length)) + 2;

  const rows = entries.map(([, meta]) => {
    const usagePadded = meta.usage.padEnd(usageWidth);
    return `  ${usagePadded}  ${meta.description}`;
  });

  return {
    output: [
      '',
      '  Available commands:',
      '  ' + '─'.repeat(usageWidth + 40),
      ...rows,
      '  ' + '─'.repeat(usageWidth + 40),
      '',
      '  Tip: type ./projects.sh  to launch an app directly.',
      '  Tip: Ctrl+C cancels a running command.',
      '',
    ],
  };
}
