/**
 * B Terminal — Isolated State Machine (Stream Buffer Architecture)
 * Each terminal window instantiates its own TerminalEngine.
 * No global state. Fully session-scoped.
 *
 * Architecture: Single append-only buffer where the LAST line is always
 * the active editable prompt. No separate input component.
 *
 * PATTERN 2: Accepts pre-fetched portfolio data for synchronous command execution.
 */

import { parseCommand } from './commandParser';
import { COMMAND_REGISTRY } from './commandRegistry';
import type { CommandResult, InteractivePrompt, OutputLine, TerminalContext } from './types';

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

  // BUG FIX #1: Make onUpdate PUBLIC so it can be rebound when component remounts
  onUpdate: () => void;

  private lineIdCounter: number = 0;
  private outputQueue: OutputLine[] = [];
  private streamTimer: ReturnType<typeof setTimeout> | null = null;
  context: TerminalContext;

  /**
   * @param onUpdate  Called whenever the buffer changes — triggers React re-render.
   * @param openWindow  OS-level callback to open a desktop window by ID.
   * @param portfolioData  Pre-fetched portfolio data for synchronous command execution.
   */
  constructor(
    onUpdate: () => void,
    openWindow?: (id: string) => void,
    portfolioData?: Record<string, unknown> | null,
  ) {
    this.onUpdate = onUpdate;
    this.context = {
      openWindow: openWindow ?? (() => {}),
      portfolioData: portfolioData ?? {},
    };
  }

  private nextId(): number {
    return ++this.lineIdCounter;
  }

  // ─── Buffer Operations ───────────────────────────────────────

  pushOutput(lines: string[], type: OutputLine['type'] = 'output'): void {
    const newLines = lines.map(text => ({ id: this.nextId(), text, type }));
    const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
    if (lastLine && lastLine.type === 'input') {
      this.outputBuffer.splice(this.outputBuffer.length - 1, 0, ...newLines);
    } else {
      this.outputBuffer.push(...newLines);
    }
    this.evict();
    this.onUpdate();
  }

  appendPrompt(prefix: string = '>_B $'): void {
    this.outputBuffer.push({ id: this.nextId(), text: '', type: 'input', prefix });
    this.evict();
    this.onUpdate();
  }

  updateActivePrompt(text: string): void {
    const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
    if (lastLine && lastLine.type === 'input') {
      this.outputBuffer[this.outputBuffer.length - 1] = { ...lastLine, text };
      this.onUpdate();
    }
  }

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

  private evict(): void {
    if (this.outputBuffer.length > MAX_BUFFER_SIZE) {
      this.outputBuffer = this.outputBuffer.slice(-MAX_BUFFER_SIZE);
    }
  }

  // ─── Streaming Queue ─────────────────────────────────────────

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

  async executeCommand(): Promise<void> {
    const input = this.freezePrompt();
    const trimmed = input.trim();

    if (!trimmed) {
      this.appendPrompt();
      return;
    }

    this.commandHistory.push(trimmed);
    if (this.commandHistory.length > 200) this.commandHistory.shift();
    this.historyIndex = this.commandHistory.length;

    this.isExecuting = true;
    this.onUpdate();

    const parsed = parseCommand(trimmed);
    const handler = COMMAND_REGISTRY[parsed.command];

    if (!handler) {
      this.pushOutput(
        [`bash: ${this.escapeHtml(parsed.command)}: command not found`],
        'error'
      );
      this.isExecuting = false;
      this.appendPrompt();
      return;
    }

    this.abortController = new AbortController();

    try {
      const result: CommandResult = await handler(parsed, this, this.context);

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
        this.appendPrompt();
        this.isExecuting = false;
        await this.pushToStreamQueue(result.output);
      } else {
        this.isExecuting = false;
        this.appendPrompt();
      }
    } catch {
      if (!this.abortController?.signal.aborted) {
        this.pushOutput(['Terminal internal error', 'Execution safely aborted'], 'error');
      }
      this.isExecuting = false;
      this.appendPrompt();
    } finally {
      this.abortController = null;
    }
  }

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

  /** Getter for the current active prompt text (what the user is typing) */
  get activePrompt(): string {
    const lastLine = this.outputBuffer[this.outputBuffer.length - 1];
    if (lastLine && lastLine.type === 'input') {
      return lastLine.text;
    }
    return '';
  }

  abort(): void {
    if (this.abortController) this.abortController.abort();
    if (this.streamTimer) { clearTimeout(this.streamTimer); this.streamTimer = null; }
    this.outputQueue = [];
    this.isStreaming = false;
    this.isExecuting = false;
    this.interactiveMode = null;
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
      this.updateActivePrompt(
        this.historyIndex >= this.commandHistory.length
          ? ''
          : this.commandHistory[this.historyIndex] || ''
      );
    }
  }

  // ─── Boot Sequence ───────────────────────────────────────────

  async loadBootSequence(): Promise<void> {
    try {
      const response = await fetch('/bTerminal.txt');
      const ascii = await response.text();
      this.pushOutput(ascii.replace(/\r/g, '').split('\n'), 'ascii');
    } catch {
      this.pushOutput(['B Terminal'], 'ascii');
    }

    this.pushOutput([
      '',
      'B Terminal initialized',
      'Type "help" to see available commands.',
      '',
    ], 'system');

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
    if (this.streamTimer) clearTimeout(this.streamTimer);
    if (this.abortController) this.abortController.abort();
    this.outputBuffer = [];
    this.commandHistory = [];
    this.outputQueue = [];
    this.interactiveMode = null;
  }
}
