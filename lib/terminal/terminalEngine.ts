/**
 * B Terminal — Isolated State Machine (Stream Buffer Architecture)
 * Each terminal window instantiates its own TerminalEngine.
 * No global state. Fully session-scoped.
 *
 * Architecture: Single append-only buffer where the LAST line is always
 * the active editable prompt. No separate input component.
 */

import { parseCommand } from './commandParser';
import { COMMAND_REGISTRY } from './commandRegistry';
import type { CommandResult, InteractivePrompt, OutputLine } from './types';

export type { OutputLine } from './types';

const MAX_BUFFER_SIZE = 500;

export class TerminalEngine {
  outputBuffer: OutputLine[] = [];
  commandHistory: string[] = [];
  historyIndex: number = -1;
  isStreaming: boolean = false;
  interactiveMode: InteractivePrompt | null = null;
  abortController: AbortController | null = null;
  isExecuting: boolean = false;

  private lineIdCounter: number = 0;
  private outputQueue: OutputLine[] = [];
  private onUpdate: () => void;
  private streamTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate;
  }

  private nextId(): number {
    return ++this.lineIdCounter;
  }

  // ─── Buffer Operations ───────────────────────────────────────

  /**
   * Push lines into the buffer (before the active prompt).
   * The active prompt is always the last line — new output inserts above it.
   */
  pushOutput(lines: string[], type: OutputLine['type'] = 'output'): void {
    const newLines = lines.map(text => ({ id: this.nextId(), text, type }));

    // Find the active prompt (last line if it's type 'input')
    const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
    if (lastLine && lastLine.type === 'input') {
      // Insert before the active prompt
      this.outputBuffer.splice(this.outputBuffer.length - 1, 0, ...newLines);
    } else {
      this.outputBuffer.push(...newLines);
    }

    this.evict();
    this.onUpdate();
  }

  /**
   * Append a new active prompt line at the end of the buffer.
   */
  appendPrompt(prefix: string = '>_B $'): void {
    this.outputBuffer.push({
      id: this.nextId(),
      text: '',
      type: 'input',
      prefix,
    });
    this.evict();
    this.onUpdate();
  }

  /**
   * Update the active prompt text (for typing and history navigation).
   */
  updateActivePrompt(text: string): void {
    const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
    if (lastLine && lastLine.type === 'input') {
      // Create a new object so React detects the change
      this.outputBuffer[this.outputBuffer.length - 1] = {
        ...lastLine,
        text,
      };
      this.onUpdate();
    }
  }

  /**
   * Freeze the active prompt: convert it from 'input' to 'prompt' (read-only).
   */
  private freezePrompt(): string {
    const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
    if (lastLine && lastLine.type === 'input') {
      const text = lastLine.text;
      const prefix = lastLine.prefix || '>_B $';
      this.outputBuffer[this.outputBuffer.length - 1] = {
        ...lastLine,
        type: 'prompt',
        text: `${prefix} ${text}`,
      };
      this.onUpdate();
      return text;
    }
    return '';
  }

  /**
   * FIFO eviction to prevent memory bloat.
   */
  private evict(): void {
    if (this.outputBuffer.length > MAX_BUFFER_SIZE) {
      this.outputBuffer = this.outputBuffer.slice(-MAX_BUFFER_SIZE);
    }
  }

  // ─── Streaming Queue ─────────────────────────────────────────

  /**
   * Push lines to the streaming queue for animated 40ms/line rendering.
   * Inserts lines above the active prompt.
   */
  pushToStreamQueue(lines: string[], type: OutputLine['type'] = 'output'): Promise<void> {
    return new Promise((resolve) => {
      const newLines = lines.map(text => ({ id: this.nextId(), text, type }));
      this.outputQueue.push(...newLines);

      if (!this.isStreaming) {
        this.startStreamLoop(resolve);
      } else {
        const checkDone = () => {
          if (this.outputQueue.length === 0 && !this.isStreaming) {
            resolve();
          } else {
            // Check less frequently, layout engine handles the frames
            setTimeout(checkDone, 100);
          }
        };
        checkDone();
      }
    });
  }

  private startStreamLoop(onDone: () => void): void {
    this.isStreaming = true;
    this.onUpdate();

    // The Render Scheduler Phase
    // Batch lines per animation frame to prevent blocking exactly like xterm.js
    const renderNext = () => {
      if (this.abortController?.signal.aborted) {
        this.outputQueue = [];
        this.isStreaming = false;
        this.onUpdate();
        onDone();
        return;
      }

      if (this.outputQueue.length === 0) {
        this.isStreaming = false;
        this.onUpdate();
        onDone();
        return;
      }

      // Batch up to 3 lines per frame (60fps = ~180 lines/sec)
      // This prevents the DOM from freezing during heavy outputs
      const batchSize = Math.min(3, this.outputQueue.length);
      const batch = this.outputQueue.splice(0, batchSize);

      const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
      if (lastLine && lastLine.type === 'input') {
        this.outputBuffer.splice(this.outputBuffer.length - 1, 0, ...batch);
      } else {
        this.outputBuffer.push(...batch);
      }

      this.evict();
      this.onUpdate();
      
      // We still use a small timeout to simulate typewriter typing, 
      // but bound the flush loop to the microtask/anim frame boundary.
      this.streamTimer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          requestAnimationFrame(renderNext);
        } else {
          renderNext();
        }
      }, 15);
    };

    if (typeof window !== 'undefined') {
      requestAnimationFrame(renderNext);
    } else {
      renderNext();
    }
  }

  // ─── Command Execution ───────────────────────────────────────

  /**
   * Execute a command from the active prompt.
   */
  async executeCommand(): Promise<void> {
    const input = this.freezePrompt();
    const trimmed = input.trim();

    if (!trimmed) {
      this.appendPrompt();
      return;
    }

    // Record in history (capped at 200 to prevent unbounded growth)
    this.commandHistory.push(trimmed);
    if (this.commandHistory.length > 200) {
      this.commandHistory.shift();
    }
    this.historyIndex = this.commandHistory.length;

    this.isExecuting = true;
    this.onUpdate();

    const parsed = parseCommand(trimmed);
    const handler = COMMAND_REGISTRY[parsed.command];

    if (!handler) {
      this.pushOutput([
        `Command not found: ${this.escapeHtml(parsed.command)}`,
        'Type "help" to see available commands.',
      ], 'error');
      this.isExecuting = false;
      this.appendPrompt();
      return;
    }

    this.abortController = new AbortController();

    try {
      const result: CommandResult = await handler(parsed, this);

      if (this.abortController.signal.aborted) {
        this.isExecuting = false;
        return;
      }

      if (result.clearScreen) {
        this.outputBuffer = [];
        this.isExecuting = false;
        this.onUpdate();
        await this.loadBootSequence();
        return;
      }

      if (result.interactiveMode) {
        this.interactiveMode = result.interactiveMode;
        const prompt = result.interactiveMode.prompts[0];
        this.pushOutput([prompt], 'system');
        this.isExecuting = false;
        this.appendPrompt('>');
        return;
      }

      if (result.output.length > 0) {
        // Append prompt first so streaming inserts above it
        this.appendPrompt();
        this.isExecuting = false;
        await this.pushToStreamQueue(result.output);
      } else {
        this.isExecuting = false;
        this.appendPrompt();
      }
    } catch {
      if (!this.abortController?.signal.aborted) {
        this.pushOutput([
          'Terminal internal error',
          'Execution safely aborted',
        ], 'error');
      }
      this.isExecuting = false;
      this.appendPrompt();
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Handle interactive mode input (msg command sequential prompts).
   */
  async handleInteractiveInput(): Promise<void> {
    if (!this.interactiveMode) return;

    const input = this.freezePrompt();
    const mode = this.interactiveMode;
    const promptKeys = ['name', 'email', 'message'];
    const currentKey = promptKeys[mode.currentIndex];

    mode.answers[currentKey] = input;
    mode.currentIndex++;

    if (mode.currentIndex < mode.prompts.length) {
      this.pushOutput([mode.prompts[mode.currentIndex]], 'system');
      this.appendPrompt('>');
    } else {
      this.interactiveMode = null;
      this.appendPrompt();
      try {
        const result = await mode.onComplete(mode.answers, this);
        await this.pushToStreamQueue(result);
      } catch {
        this.pushOutput(['✖ Failed to send message', 'Please use the contact form instead.'], 'error');
      }
    }
  }

  // ─── Controls ────────────────────────────────────────────────

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }

    if (this.streamTimer) {
      clearTimeout(this.streamTimer);
      this.streamTimer = null;
    }

    this.outputQueue = [];
    this.isStreaming = false;
    this.isExecuting = false;
    this.interactiveMode = null;

    // Freeze current prompt, show ^C, append new prompt
    this.freezePrompt();
    this.pushOutput(['^C', 'Command cancelled'], 'error');
    this.appendPrompt();
  }

  navigateHistory(direction: 'up' | 'down'): void {
    if (this.commandHistory.length === 0) return;

    if (direction === 'up') {
      this.historyIndex = Math.max(0, this.historyIndex - 1);
      this.updateActivePrompt(this.commandHistory[this.historyIndex] || '');
    } else {
      this.historyIndex = Math.min(this.commandHistory.length, this.historyIndex + 1);
      if (this.historyIndex >= this.commandHistory.length) {
        this.updateActivePrompt('');
      } else {
        this.updateActivePrompt(this.commandHistory[this.historyIndex] || '');
      }
    }
  }

  // ─── Boot Sequence ───────────────────────────────────────────

  async loadBootSequence(): Promise<void> {
    try {
      const response = await fetch('/bTerminal.txt');
      const ascii = await response.text();
      const asciiLines = ascii.replace(/\r/g, '').split('\n');
      this.pushOutput(asciiLines, 'ascii');
    } catch {
      this.pushOutput(['B Terminal'], 'ascii');
    }

    this.pushOutput([
      '',
      'B Terminal initialized',
      'Type "help" to see available commands.',
      '',
    ], 'system');

    // Append the first active prompt
    this.appendPrompt();
  }

  // ─── Utilities ───────────────────────────────────────────────

  escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  destroy(): void {
    if (this.streamTimer) {
      clearTimeout(this.streamTimer);
    }
    if (this.abortController) {
      this.abortController.abort();
    }
    this.outputBuffer = [];
    this.commandHistory = [];
    this.outputQueue = [];
    this.interactiveMode = null;
  }
}
