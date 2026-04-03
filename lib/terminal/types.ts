/**
 * B Terminal — Shared Types
 */

import type { ParsedCommand } from './commandParser';

export type { ParsedCommand };

// ─── Context ──────────────────────────────────────────────────────────────────

/** Passed to every command handler so commands can interact with the OS. */
export interface TerminalContext {
  /** Open a desktop window by its registry ID (e.g. 'projects', 'learnings'). */
  openWindow: (id: string) => void;
  /** Pre-fetched portfolio data (PATTERN 2: synchronous access for fast command execution) */
  portfolioData?: Record<string, unknown>;
}

// ─── Command ──────────────────────────────────────────────────────────────────

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[], context: TerminalContext) => Promise<CommandResult>;
}

// ─── Results ──────────────────────────────────────────────────────────────────

export interface CommandResult {
  output: string[];
  clearScreen?: boolean;
  interactiveMode?: InteractivePrompt | null;
}

export interface InteractivePrompt {
  prompts: string[];
  currentIndex: number;
  answers: Record<string, string>;
  onComplete: (answers: Record<string, string>, engine: ITerminalEngine) => Promise<string[]>;
}

// ─── Engine Interface ─────────────────────────────────────────────────────────

export interface ITerminalEngine {
  outputBuffer: OutputLine[];
  commandHistory: string[];
  historyIndex: number;
  isStreaming: boolean;
  isExecuting: boolean;
  interactiveMode: InteractivePrompt | null;
  abortController: AbortController | null;
  pushOutput(lines: string[], type?: OutputLine['type']): void;
  pushToStreamQueue(lines: string[], type?: OutputLine['type']): Promise<void>;
  escapeHtml(str: string): string;
  updateActivePrompt(text: string): void;
  appendPrompt(prefix?: string): void;
  handleInteractiveInput(): Promise<void>;
  executeCommand(): Promise<void>;
}

export interface OutputLine {
  id: number;
  text: string;
  type: 'output' | 'prompt' | 'error' | 'system' | 'ascii' | 'input';
  prefix?: string;
}

/**
 * CommandHandler receives the parsed command, the engine instance, and the
 * OS-level context (openWindow etc.) so commands stay fully decoupled from UI.
 */
export type CommandHandler = (
  cmd: ParsedCommand,
  engine: ITerminalEngine,
  context: TerminalContext,
) => Promise<CommandResult>;