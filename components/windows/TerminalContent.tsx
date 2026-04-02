"use client";

/**
 * B Terminal — High-Performance Architecture
 *
 * Optimization Patterns:
 * 1. Isolated Input: <TerminalInput /> is memoized, never causes history re-renders
 * 2. Pre-fetched Context: Portfolio data fetched once, passed synchronously to engine
 * 3. Scroll-Lock: Scroll effect locked to [lines.length] dependency only
 */

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { TerminalEngine, OutputLine } from '@/lib/terminal/terminalEngine';
import { useWindows } from '@/components/WindowManager';
import { getComponent } from '@/components/ComponentRegistry';
import { getPortfolioData } from '@/lib/actions';
import { getTerminalState, setTerminalEngine, clearTerminalState, hasTerminalState } from '@/lib/terminal/terminalStateStore';

// Memoized output line (read-only lines)
const TerminalLine = memo(function TerminalLine({ line }: { line: OutputLine }) {
  const colorClass = (() => {
    switch (line.type) {
      case 'prompt': return 'text-violet-400';
      case 'error': return 'text-red-400';
      case 'system': return 'text-emerald-400';
      case 'ascii': return 'text-violet-300';
      default: return 'text-gray-100';
    }
  })();

  const isAscii = line.type === 'ascii';
  const layoutClass = isAscii
    ? 'whitespace-pre leading-none'
    : 'whitespace-pre-wrap break-all leading-relaxed';

  return (
    <div className={`${layoutClass} font-mono text-sm ${colorClass}`}>
      {line.text}
    </div>
  );
});

// ─── PATTERN 1: Isolated Input Component ─────────────────────────────────────
// This is memoized so typing NEVER causes parent re-renders
const TerminalInput = memo(function TerminalInput({
  isStreaming,
  isFocused,
  onFocus,
  onBlur,
  onSubmit,
  inputRef,
  onTerminalClick,
}: {
  isStreaming: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: (command: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onTerminalClick: () => void;
}) {
  // Auto-refocus after streaming finishes
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStreaming, inputRef]);

  const prefix = '>_B $';

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const input = inputRef.current;
    if (!input) return;

    // Ctrl+C — abort (handled by parent)
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      // Parent engine will handle abort
      return;
    }

    // Block during execution
    if (isStreaming) {
      e.preventDefault();
      return;
    }

    // Enter — submit command to parent
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = input.value;
      onSubmit(command);
      // Input clearing is handled by parent's syncState
      return;
    }

    // Arrow Up/Down — handled by parent engine directly
    // (No keystroke handling needed here; parent manages history)
  }, [isStreaming, inputRef, onSubmit]);

  return (
    <div className="flex items-center font-mono text-sm leading-relaxed">
      <span className="text-violet-400 font-bold whitespace-nowrap mr-1">
        {prefix}
      </span>
      {/* PURELY UNCONTROLLED INPUT — browser manages value completely */}
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex-1 min-w-0 bg-transparent text-violet-300 outline-none border-none font-mono text-sm caret-violet-400 p-0 m-0"
        autoFocus
        spellCheck={false}
        autoComplete="off"
        disabled={isStreaming}
        defaultValue=""
        onClick={onTerminalClick}
      />
    </div>
  );
});

// ─── Main Terminal Component ────────────────────────────────────────────────
export default function TerminalContent({ windowId }: { windowId?: string }) {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const { openWindow } = useWindows();
  const engineRef = useRef<TerminalEngine | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // PATTERN 2: Pre-fetch portfolio data once
  const portDataRef = useRef<Record<string, unknown>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Use window ID or fallback to 'terminal-default'
  const terminalId = windowId || 'terminal-default';

  // Sync engine state → React state AND persist to global store
  const syncState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const newLines = [...engine.outputBuffer];
    const isStr = engine.isStreaming;

    setLines(newLines);
    setIsStreaming(isStr);

    // Clear the input field after command execution
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Persist to global store so state survives re-mounts
    const state = getTerminalState(terminalId);
    state.lines = newLines;
    state.isStreaming = isStr;
  }, [terminalId]);

  // OS-level openWindow bridge for the terminal engine
  const handleOpenWindow = useCallback((id: string) => {
    const Component = getComponent(id);
    openWindow({
      id,
      title: id.charAt(0).toUpperCase() + id.slice(1),
      icon: 'file',
      type: 'file',
      content: React.createElement(Component),
    });
  }, [openWindow]);

  // Fetch portfolio data once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPortfolioData();
        portDataRef.current = data;
        setDataLoaded(true);
      } catch (err) {
        console.error('[Terminal] Failed to load portfolio data:', err);
        portDataRef.current = {}; // Empty object, never null
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Initialize or restore engine from global store
  useEffect(() => {
    if (!dataLoaded) return; // Wait for data to load

    // Check if we already have a persisted engine for this terminal
    if (hasTerminalState(terminalId)) {
      const state = getTerminalState(terminalId);
      if (state.engine) {
        engineRef.current = state.engine;

        // BUG FIX #1: Rebind the callback to the newly mounted component's syncState
        // This prevents the "dead callback" where the engine talks to the old unmounted component
        state.engine.onUpdate = syncState;

        // Update engine's context with the pre-fetched data
        if (engineRef.current.context) {
          engineRef.current.context.portfolioData = portDataRef.current;
        }
        // Restore React state immediately from global store
        if (state.lines) setLines([...state.lines]);
        if (state.isStreaming !== undefined) setIsStreaming(state.isStreaming);
        return;
      }
    }

    // Create new engine and persist it
    const engine = new TerminalEngine(syncState, handleOpenWindow, portDataRef.current);
    engineRef.current = engine;
    setTerminalEngine(terminalId, engine);
    engine.loadBootSequence().then(() => syncState());

    return () => {
      // Don't destroy engine on unmount - keep it in global store
    };
  }, [terminalId, syncState, handleOpenWindow, dataLoaded]);

  // PATTERN 3: Scroll-Lock — dependency array locked to [lines.length]
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!userScrolledUpRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines.length]); // LOCKED: Only fire when history size changes, not on every render

  // Track user scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledUpRef.current = !atBottom;
  }, []);

  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Handle command submission from input
  const handleCommandSubmit = useCallback((command: string) => {
    if (!engineRef.current) return;
    userScrolledUpRef.current = false; // Force scroll to bottom

    const engine = engineRef.current;

    // Update engine with the command
    engine.updateActivePrompt(command);

    // Execute the command
    if (engine.interactiveMode) {
      engine.handleInteractiveInput();
    } else {
      engine.executeCommand();
    }
  }, []);

  // Handle global keyboard events (Ctrl+C, arrow keys for history)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Ctrl+C — abort
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      engine.abort();
      return;
    }

    // Arrow Up — navigate history backwards
    if (e.key === 'ArrowUp' && inputRef.current && !isStreaming) {
      e.preventDefault();
      engine.navigateHistory('up');
      inputRef.current.value = engine.activePrompt;
      return;
    }

    // Arrow Down — navigate history forwards
    if (e.key === 'ArrowDown' && inputRef.current && !isStreaming) {
      e.preventDefault();
      engine.navigateHistory('down');
      inputRef.current.value = engine.activePrompt;
      return;
    }
  }, [isStreaming]);

  // Separate the active prompt (last line if type 'input') from read-only lines
  const lastLine = lines[lines.length - 1];
  const isLastLineInput = lastLine?.type === 'input';

  // Virtualize: Render only the last 120 lines to prevent heavy DOM node counts
  const allReadOnlyLines = isLastLineInput ? lines.slice(0, -1) : lines;
  const VIRTUAL_LIMIT = 120;
  const readOnlyLines = allReadOnlyLines.length > VIRTUAL_LIMIT
    ? allReadOnlyLines.slice(-VIRTUAL_LIMIT)
    : allReadOnlyLines;

  const activePrompt = isLastLineInput ? lastLine : null;

  return (
    <div
      className="flex flex-col h-full w-full bg-black font-mono text-sm select-text cursor-text"
      onClick={handleTerminalClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {/* Read-only output lines */}
        {readOnlyLines.map(line => (
          <TerminalLine key={line.id} line={line} />
        ))}

        {/* Isolated memoized input — typing never causes history re-renders */}
        {activePrompt && (
          <TerminalInput
            isStreaming={isStreaming}
            isFocused={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmit={handleCommandSubmit}
            inputRef={inputRef}
            onTerminalClick={handleTerminalClick}
          />
        )}
      </div>
    </div>
  );
}
