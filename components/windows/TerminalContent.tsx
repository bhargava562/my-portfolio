"use client";

/**
 * B Terminal — Stream Buffer Renderer
 * Renders the terminal from a single linear buffer.
 * The prompt is the LAST LINE in the buffer (type 'input'), not a separate component.
 */

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { TerminalEngine, OutputLine } from '@/lib/terminal/terminalEngine';
import { useWindows } from '@/components/WindowManager';
import { getComponent } from '@/components/ComponentRegistry';

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

// Active prompt line (editable, always last in buffer)
function ActivePromptLine({
  line,
  cursorVisible,
  isStreaming,
  isFocused,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  inputRef,
}: {
  line: OutputLine;
  cursorVisible: boolean;
  isStreaming: boolean;
  isFocused: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  // Auto-refocus the input when streaming finishes
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStreaming, inputRef]);

  const prefix = line.prefix || '>_B $';

  return (
    <div className="flex items-center font-mono text-sm leading-relaxed whitespace-pre-wrap">
      <span className="text-violet-400 font-bold whitespace-nowrap mr-1">
        {prefix}
      </span>
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={line.text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full bg-transparent text-violet-300 outline-none border-none font-mono text-sm caret-transparent p-0 m-0"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          disabled={isStreaming}
        />
        {/* Blinking block cursor */}
        <span
          className="absolute top-0 text-violet-400 pointer-events-none font-mono text-sm"
          style={{ left: `${line.text.length}ch` }}
        >
          {cursorVisible && !isStreaming && isFocused ? '█' : '\u00A0'}
        </span>
      </div>
    </div>
  );
}

export default function TerminalContent() {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(true);

  const { openWindow } = useWindows();
  const engineRef = useRef<TerminalEngine | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userScrolledUpRef = useRef(false);

  // Sync engine state → React state
  const syncState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setLines([...engine.outputBuffer]);
    setIsStreaming(engine.isStreaming);
  }, []);

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

  // Initialize engine
  useEffect(() => {
    const engine = new TerminalEngine(syncState, handleOpenWindow);
    engineRef.current = engine;
    engine.loadBootSequence().then(() => syncState());

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [syncState, handleOpenWindow]);

  // Blinking cursor 500ms
  useEffect(() => {
    cursorTimerRef.current = setInterval(() => setCursorVisible(v => !v), 500);
    return () => {
      if (cursorTimerRef.current) clearInterval(cursorTimerRef.current);
    };
  }, []);

  // Smart auto-scroll: only scroll if user is at bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!userScrolledUpRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const engine = engineRef.current;
    if (engine && !engine.isStreaming && !engine.isExecuting) {
      engine.updateActivePrompt(e.target.value);
    }
  }, []);

  // All keyboard handling — updates engine directly
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Isolating key events to prevent Next.js lock screen router hijacking
    e.stopPropagation();

    const engine = engineRef.current;
    if (!engine) return;

    // Ctrl+C — abort
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      engine.abort();
      return;
    }

    // Block input during streaming/execution
    if (engine.isStreaming || engine.isExecuting) {
      e.preventDefault();
      return;
    }

    // Enter — execute
    if (e.key === 'Enter') {
      e.preventDefault();
      userScrolledUpRef.current = false; // Force scroll to bottom on execute
      if (engine.interactiveMode) {
        engine.handleInteractiveInput();
      } else {
        engine.executeCommand();
      }
      return;
    }

    // Arrow Up/Down — history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      engine.navigateHistory('up');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      engine.navigateHistory('down');
      return;
    }

    // Default browser typing behavior will be caught by onChange
  }, []);

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

        {/* Active editable prompt (always last) */}
        {activePrompt && (
          <ActivePromptLine
            line={activePrompt}
            cursorVisible={cursorVisible}
            isStreaming={isStreaming}
            isFocused={isFocused}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            inputRef={inputRef}
          />
        )}
      </div>
    </div>
  );
}
