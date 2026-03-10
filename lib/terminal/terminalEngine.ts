/**
 * B Terminal — Isolated State Machine
 * Each terminal window instantiates its own TerminalEngine.
 * No global state. Fully session-scoped.
 */

import { parseCommand } from './commandParser';
import { COMMAND_REGISTRY, CommandResult, InteractivePrompt } from './commandRegistry';

export interface OutputLine {
  id: number;
  text: string;
  type: 'output' | 'prompt' | 'error' | 'system' | 'ascii';
}

const MAX_BUFFER_SIZE = 120;

export class TerminalEngine {
  outputBuffer: OutputLine[] = [];
  commandHistory: string[] = [];
  historyIndex: number = -1;
  isStreaming: boolean = false;
  interactiveMode: InteractivePrompt | null = null;
  abortController: AbortController | null = null;

  private lineIdCounter: number = 0;
  private outputQueue: OutputLine[] = [];
  private onUpdate: () => void;
  private streamTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate;
  }

  /**
   * Generate a unique line ID for React keying
   */
  private nextId(): number {
    return ++this.lineIdCounter;
  }

  /**
   * Push lines into the output buffer with FIFO eviction at 120 lines
   */
  pushOutput(lines: string[], type: OutputLine['type'] = 'output'): void {
    const newLines = lines.map(text => ({ id: this.nextId(), text, type }));
    this.outputBuffer.push(...newLines);

    // FIFO eviction
    if (this.outputBuffer.length > MAX_BUFFER_SIZE) {
      this.outputBuffer = this.outputBuffer.slice(-MAX_BUFFER_SIZE);
    }

    this.onUpdate();
  }

  /**
   * Push lines into the streaming queue for animated rendering (40ms/line)
   */
  pushToStreamQueue(lines: string[], type: OutputLine['type'] = 'output'): Promise<void> {
    return new Promise((resolve) => {
      const newLines = lines.map(text => ({ id: this.nextId(), text, type }));
      this.outputQueue.push(...newLines);

      if (!this.isStreaming) {
        this.startStreamLoop(resolve);
      } else {
        // Already streaming, resolve after existing queue drains
        const checkDone = () => {
          if (this.outputQueue.length === 0 && !this.isStreaming) {
            resolve();
          } else {
            setTimeout(checkDone, 50);
          }
        };
        checkDone();
      }
    });
  }

  private startStreamLoop(onDone: () => void): void {
    this.isStreaming = true;

    const renderNext = () => {
      // Check abort
      if (this.abortController?.signal.aborted) {
        this.outputQueue = [];
        this.isStreaming = false;
        onDone();
        return;
      }

      if (this.outputQueue.length === 0) {
        this.isStreaming = false;
        onDone();
        return;
      }

      const line = this.outputQueue.shift()!;
      this.outputBuffer.push(line);

      // FIFO eviction
      if (this.outputBuffer.length > MAX_BUFFER_SIZE) {
        this.outputBuffer = this.outputBuffer.slice(-MAX_BUFFER_SIZE);
      }

      this.onUpdate();
      this.streamTimer = setTimeout(renderNext, 40);
    };

    renderNext();
  }

  /**
   * Execute a command string
   */
  async executeCommand(input: string): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Record in history
    this.commandHistory.push(trimmed);
    this.historyIndex = this.commandHistory.length;

    // Show the prompt + command in output
    this.pushOutput([`>_B $ ${trimmed}`], 'prompt');

    const parsed = parseCommand(trimmed);

    // O(1) lookup
    const handler = COMMAND_REGISTRY[parsed.command];

    if (!handler) {
      this.pushOutput([
        `Command not found: ${this.escapeHtml(parsed.command)}`,
        'Type "help" to see available commands.',
      ], 'error');
      return;
    }

    // Create abort controller for this execution
    this.abortController = new AbortController();

    try {
      const result: CommandResult = await handler(parsed, this);

      // Check if aborted during execution
      if (this.abortController.signal.aborted) return;

      if (result.clearScreen) {
        this.outputBuffer = [];
        this.onUpdate();
        // After clear, load boot sequence again
        await this.loadBootSequence();
        return;
      }

      if (result.interactiveMode) {
        this.interactiveMode = result.interactiveMode;
        // Show first prompt
        const prompt = result.interactiveMode.prompts[0];
        this.pushOutput([prompt], 'system');
        return;
      }

      if (result.output.length > 0) {
        await this.pushToStreamQueue(result.output);
      }
    } catch {
      if (!this.abortController.signal.aborted) {
        this.pushOutput([
          'Terminal internal error',
          'Execution safely aborted',
        ], 'error');
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Handle interactive mode input
   */
  async handleInteractiveInput(input: string): Promise<void> {
    if (!this.interactiveMode) return;

    const mode = this.interactiveMode;
    const promptKeys = ['name', 'email', 'message'];
    const currentKey = promptKeys[mode.currentIndex];

    // Show user's input
    this.pushOutput([`> ${input}`], 'prompt');

    mode.answers[currentKey] = input;
    mode.currentIndex++;

    if (mode.currentIndex < mode.prompts.length) {
      // Show next prompt
      this.pushOutput([mode.prompts[mode.currentIndex]], 'system');
    } else {
      // All answers collected — execute completion
      this.interactiveMode = null;
      try {
        const result = await mode.onComplete(mode.answers, this);
        await this.pushToStreamQueue(result);
      } catch {
        this.pushOutput(['✖ Failed to send message', 'Please use the contact form instead.'], 'error');
      }
    }
  }

  /**
   * Abort current command (Ctrl+C)
   */
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
    this.interactiveMode = null;

    this.pushOutput(['^C', 'Command cancelled'], 'error');
  }

  /**
   * Navigate history with clamped boundaries
   */
  navigateHistory(direction: 'up' | 'down'): string {
    if (this.commandHistory.length === 0) return '';

    if (direction === 'up') {
      // Clamp at 0 (first command)
      this.historyIndex = Math.max(0, this.historyIndex - 1);
      return this.commandHistory[this.historyIndex] || '';
    } else {
      // Clamp at length (beyond last = clear input)
      this.historyIndex = Math.min(this.commandHistory.length, this.historyIndex + 1);
      if (this.historyIndex >= this.commandHistory.length) {
        return '';
      }
      return this.commandHistory[this.historyIndex] || '';
    }
  }

  /**
   * Load the boot sequence (ASCII banner + boot message)
   */
  async loadBootSequence(): Promise<void> {
    try {
      const response = await fetch('/bTerminal.txt');
      const ascii = await response.text();
      const asciiLines = ascii.split('\n');
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
  }

  /**
   * Escape HTML entities to prevent DOM injection
   */
  escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Destroy the engine instance
   */
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
