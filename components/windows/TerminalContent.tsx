"use client";

/**
 * B Terminal — Terminal Content Component
 * Renders inside a Window frame via ComponentRegistry.
 * Each mount creates an isolated TerminalEngine instance.
 */

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { TerminalEngine, OutputLine } from '@/lib/terminal/terminalEngine';

// Memoized output line for React diffing performance
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

  return (
    <div className={`whitespace-pre-wrap break-all font-mono text-sm leading-relaxed ${colorClass}`}>
      {line.text}
    </div>
  );
});

export default function TerminalContent() {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [input, setInput] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [booted, setBooted] = useState(false);

  const engineRef = useRef<TerminalEngine | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync engine state to React state (called by engine on every update)
  const syncState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setLines([...engine.outputBuffer]);
    setIsStreaming(engine.isStreaming);
    setIsInteractive(!!engine.interactiveMode);
  }, []);

  // Initialize engine on mount
  useEffect(() => {
    const engine = new TerminalEngine(syncState);
    engineRef.current = engine;

    // Boot sequence
    engine.loadBootSequence().then(() => {
      setBooted(true);
      syncState();
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [syncState]);

  // Blinking cursor at 500ms
  useEffect(() => {
    cursorTimerRef.current = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);

    return () => {
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom on output change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on any click inside the terminal
  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Ctrl+C — abort
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      engine.abort();
      setInput('');
      return;
    }

    // Enter — execute
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input;
      setInput('');

      if (engine.interactiveMode) {
        await engine.handleInteractiveInput(cmd);
      } else {
        await engine.executeCommand(cmd);
      }
      return;
    }

    // Arrow Up — history navigate
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = engine.navigateHistory('up');
      setInput(prev);
      return;
    }

    // Arrow Down — history navigate
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = engine.navigateHistory('down');
      setInput(next);
      return;
    }
  }, [input]);

  return (
    <div
      className="flex flex-col h-full w-full bg-black font-mono text-sm select-text cursor-text"
      onClick={handleTerminalClick}
    >
      {/* Output area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-0"
      >
        {lines.map(line => (
          <TerminalLine key={line.id} line={line} />
        ))}
      </div>

      {/* Prompt input line */}
      {booted && (
        <div className="flex items-center px-4 py-2 shrink-0">
          <span className="text-violet-400 font-bold whitespace-nowrap mr-2">
            {isInteractive ? '>' : '>_B $'}
          </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-violet-300 outline-none border-none font-mono text-sm caret-transparent"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              disabled={isStreaming}
            />
            {/* Custom blinking cursor */}
            <span
              className="absolute top-0 text-violet-400 pointer-events-none font-mono text-sm"
              style={{ left: `${input.length * 0.6}em` }}
            >
              {cursorVisible && !isStreaming ? '█' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
