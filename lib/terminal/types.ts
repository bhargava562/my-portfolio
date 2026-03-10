/**
 * B Terminal — Shared Types
 * Extracted to break circular dependency between commandRegistry and terminalEngine.
 */

import type { ParsedCommand } from './commandParser';

export type { ParsedCommand };

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

/**
 * Interface for TerminalEngine — used by command handlers to avoid importing the class directly.
 */
export interface ITerminalEngine {
  outputBuffer: OutputLine[];
  commandHistory: string[];
  historyIndex: number;
  isStreaming: boolean;
  interactiveMode: InteractivePrompt | null;
  abortController: AbortController | null;
  pushOutput(lines: string[], type?: OutputLine['type']): void;
  pushToStreamQueue(lines: string[], type?: OutputLine['type']): Promise<void>;
  escapeHtml(str: string): string;
}

export interface OutputLine {
  id: number;
  text: string;
  type: 'output' | 'prompt' | 'error' | 'system' | 'ascii';
}

export type CommandHandler = (
  cmd: ParsedCommand,
  engine: ITerminalEngine
) => Promise<CommandResult>;

