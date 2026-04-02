/**
 * Global Terminal State Store
 * Persists terminal engine instances and React rendering state across window re-renders
 * to prevent history loss during maximize/minimize operations.
 */

import { TerminalEngine, OutputLine } from '@/lib/terminal/terminalEngine';

interface TerminalState {
  engine: TerminalEngine | null;
  initialized: boolean;
  lines?: OutputLine[];
  isStreaming?: boolean;
}

// Global store keyed by window ID
const terminalStates = new Map<string, TerminalState>();

export function getTerminalState(windowId: string): TerminalState {
  if (!terminalStates.has(windowId)) {
    terminalStates.set(windowId, {
      engine: null,
      initialized: false,
    });
  }
  return terminalStates.get(windowId)!;
}

export function setTerminalEngine(windowId: string, engine: TerminalEngine): void {
  const state = getTerminalState(windowId);
  state.engine = engine;
  state.initialized = true;
}

export function clearTerminalState(windowId: string): void {
  const state = terminalStates.get(windowId);
  if (state?.engine) {
    state.engine.destroy();
  }
  terminalStates.delete(windowId);
}

export function hasTerminalState(windowId: string): boolean {
  return terminalStates.has(windowId) && terminalStates.get(windowId)!.initialized;
}
