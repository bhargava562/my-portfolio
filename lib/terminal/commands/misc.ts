/**
 * B Terminal — Miscellaneous commands
 * pwd, date, time, echo, whoami, neofetch, clear, history, version, hireme
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ParsedCommand, CommandResult, ITerminalEngine, TerminalContext } from '../types';

export async function pwdCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  return { output: ['/home/bhargava/portfolio'] };
}

export async function dateCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  return {
    output: [new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })],
  };
}

export async function timeCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  return {
    output: [new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    })],
  };
}

export async function echoCommand(cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  // Collect all rawArgs and strip surrounding quotes from each token
  const text = cmd.rawArgs
    .map(t => (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))
      ? t.slice(1, -1)
      : t
    )
    .join(' ');
  return { output: [text || ''] };
}

export async function whoamiCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  const uptime = Math.floor(performance.now() / 1000);
  const mins = Math.floor(uptime / 60);
  const secs = uptime % 60;

  return {
    output: [
      '',
      '  ██████╗ ██╗  ██╗ █████╗ ██████╗  ██████╗  █████╗ ██╗   ██╗ █████╗',
      '  ██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔════╝ ██╔══██╗██║   ██║██╔══██╗',
      '  ██████╔╝███████║███████║██████╔╝██║  ███╗███████║██║   ██║███████║',
      '  ██╔══██╗██╔══██║██╔══██║██╔══██╗██║   ██║██╔══██║╚██╗ ██╔╝██╔══██║',
      '  ██████╔╝██║  ██║██║  ██║██║  ██║╚██████╔╝██║  ██║ ╚████╔╝ ██║  ██║',
      '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝',
      '',
      '  User    : bhargava',
      '  Role    : Java Developer · Aspiring Software, AI & Platform Engineer',
      '  Location: Avadi, Tamil Nadu, India',
      '  Degree  : B.E. Computer Science',
      `  Uptime  : ${mins}m ${secs}s`,
      '',
      '  Run  neofetch  for full system info.',
      '',
    ],
  };
}

export async function neofetchCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  const uptime = Math.floor(performance.now() / 1000);
  const mins = Math.floor(uptime / 60);
  const secs = uptime % 60;
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return {
    output: [
      '',
      '  ██████╗  █████╗',
      '  ██╔══██╗██╔══██╗     bhargava@portfolio-os',
      '  ██████╔╝███████║     ─────────────────────────────────────',
      '  ██╔══██╗██╔══██║     OS       : Portfolio OS (Ubuntu 24.04 LTS)',
      '  ██████╔╝██║  ██║     Shell    : B Terminal v1.0',
      '  ╚═════╝ ╚═╝  ╚═╝     Kernel   : Next.js 16 + React 19',
      '                        Uptime   : ' + `${mins}m ${secs}s`,
      '                        Time     : ' + now,
      '                        ─────────────────────────────────────',
      '                        Stack    : Java · Spring Boot · React',
      '                                   LangGraph · TypeScript · SQL',
      '                        Interests: AI Agents · Platform Eng',
      '                                   Distributed Systems',
      '                        Status   : Open to opportunities ✓',
      '                        ─────────────────────────────────────',
      '                        ● ● ● ● ● ● ● ● (Yaru Dark)',
      '',
    ],
  };
}

export async function clearCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  return { output: [], clearScreen: true };
}

export async function historyCommand(_cmd: ParsedCommand, engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  if (engine.commandHistory.length === 0) return { output: ['No commands in history.'] };
  return {
    output: [
      'Command history:',
      '',
      ...engine.commandHistory.map((cmd, i) => `  ${(i + 1).toString().padStart(4)}  ${cmd}`),
      '',
    ],
  };
}

export async function versionCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  return {
    output: ['', '  B Terminal v1.0', '  Built by Bhargava A', '  Powered by Next.js + React 19', ''],
  };
}

export async function hiremeCommand(_cmd: ParsedCommand, _engine: ITerminalEngine, _ctx: TerminalContext): Promise<CommandResult> {
  return {
    output: [
      '',
      '  ╔═══════════════════════════════════════╗',
      '  ║      🚀 CANDIDATE STATUS: READY       ║',
      '  ╠═══════════════════════════════════════╣',
      '  ║  ✔ Skills verified                    ║',
      '  ║  ✔ Projects shipped                   ║',
      '  ║  ✔ Open source contributions          ║',
      '  ║  ✔ Available for opportunities        ║',
      '  ╠═══════════════════════════════════════╣',
      '  ║  📧 msg --user   (send a message)     ║',
      '  ║  🌐 open contact (contact form)       ║',
      '  ╚═══════════════════════════════════════╝',
      '',
    ],
  };
}
