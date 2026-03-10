/**
 * B Terminal — Miscellaneous commands
 * pwd, date, time, whoareyou, clear, history, version, hireme
 */

import { ParsedCommand } from '../commandParser';
import { CommandResult } from '../commandRegistry';
import type { TerminalEngine } from '../terminalEngine';

export async function pwdCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  return {
    output: ['/home/bhargava/portfolio'],
  };
}

export async function dateCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  const now = new Date();
  return {
    output: [now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })],
  };
}

export async function timeCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  const now = new Date();
  return {
    output: [now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })],
  };
}

export async function whoareyouCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  return {
    output: [
      '',
      '  ┌─────────────────────────────────────┐',
      '  │  Bhargava A                          │',
      '  │  Java Developer | Aspiring Software, │',
      '  │  AI & Platform Engineer              │',
      '  │                                       │',
      '  │  📍 Avadi, TamilNadu, India            │',
      '  │  🎓 B.E. Computer Science              │',
      '  └─────────────────────────────────────┘',
      '',
    ],
  };
}

export async function clearCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  return {
    output: [],
    clearScreen: true,
  };
}

export async function historyCommand(_cmd: ParsedCommand, engine: TerminalEngine): Promise<CommandResult> {
  if (engine.commandHistory.length === 0) {
    return { output: ['No commands in history.'] };
  }

  const lines = engine.commandHistory.map(
    (cmd, i) => `  ${(i + 1).toString().padStart(4)}  ${cmd}`
  );

  return {
    output: ['Command history:', '', ...lines, ''],
  };
}

export async function versionCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  return {
    output: [
      '',
      '  B Terminal v1.0',
      '  Built by Bhargava A',
      '  Powered by Next.js + React 19',
      '',
    ],
  };
}

export async function hiremeCommand(_cmd: ParsedCommand, _engine: TerminalEngine): Promise<CommandResult> {
  return {
    output: [
      '',
      '  ╔═══════════════════════════════════════╗',
      '  ║      🚀 CANDIDATE STATUS: READY       ║',
      '  ╠═══════════════════════════════════════╣',
      '  ║                                        ║',
      '  ║  ✔ Skills verified                     ║',
      '  ║  ✔ Projects shipped                    ║',
      '  ║  ✔ Open source contributions           ║',
      '  ║  ✔ Available for opportunities          ║',
      '  ║                                        ║',
      '  ║  📧 Contact via terminal:               ║',
      '  ║     msg --user                         ║',
      '  ║                                        ║',
      '  ║  🌐 Or use the Contact Me app          ║',
      '  ║     on the desktop                     ║',
      '  ║                                        ║',
      '  ╚═══════════════════════════════════════╝',
      '',
    ],
  };
}
