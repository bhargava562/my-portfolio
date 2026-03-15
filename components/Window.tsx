import React, { memo } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useWindows, WindowData } from './WindowManager';
import { getComponent } from './ComponentRegistry';

interface WindowProps {
  windowData: WindowData;
}

/**
 * Stable module-scope component that encapsulates the dynamic registry lookup.
 * Declared outside Window's render so the linter sees a static component reference.
 * getComponent returns stable module-scope references (next/dynamic singletons).
 */
/* eslint-disable react-hooks/static-components -- getComponent returns stable module-scope next/dynamic refs, not new components */
const RegistryContent = memo(function RegistryContent({ windowData }: { windowData: WindowData }) {
  const Component = getComponent(windowData.baseId);
  return <Component {...windowData.props} windowData={windowData} />;
});
/* eslint-enable react-hooks/static-components */

const Window = memo(function Window({ windowData }: WindowProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    setActiveWindow,
    activeWindowId,
    updateWindowPosition,
    updateWindowSize,
  } = useWindows();

  const isActive = activeWindowId === windowData.id;

  const Content = windowData.content ?? <RegistryContent windowData={windowData} />;

  // Handle Maximize State
  if (windowData.isMaximized) {
    return (
      <div
        className="fixed inset-0 flex flex-col pointer-events-auto"
        style={{ top: '28px', left: '64px', width: 'calc(100vw - 64px)', height: 'calc(100vh - 28px)', zIndex: windowData.zIndex }}
      >
        <WindowFrame
          windowData={windowData}
          isActive={isActive}
          onMinimize={() => minimizeWindow(windowData.id)}
          onMaximize={() => maximizeWindow(windowData.id)}
          onClose={() => closeWindow(windowData.id)}
          onMouseDown={() => setActiveWindow(windowData.id)}
        >
          {Content}
        </WindowFrame>
      </div>
    );
  }

  return (
    <Rnd
      default={{
        x: windowData.position.x,
        y: windowData.position.y,
        width: windowData.size.width,
        height: windowData.size.height,
      }}
      onDragStop={(e, d) => {
        updateWindowPosition(windowData.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize(windowData.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updateWindowPosition(windowData.id, position);
      }}
      onMouseDown={() => setActiveWindow(windowData.id)}
      minWidth={300}
      minHeight={200}
      style={{ zIndex: windowData.zIndex }}
      className="flex flex-col pointer-events-auto"
      dragHandleClassName="window-drag-handle"
      cancel=".window-controls"
      bounds="parent"
    >
      <WindowFrame
        windowData={windowData}
        isActive={isActive}
        onMinimize={() => minimizeWindow(windowData.id)}
        onMaximize={() => maximizeWindow(windowData.id)}
        onClose={() => closeWindow(windowData.id)}
        onMouseDown={() => setActiveWindow(windowData.id)}
      >
        {Content}
      </WindowFrame>
    </Rnd>
  );
});

export default Window;

interface WindowFrameProps {
  children: React.ReactNode;
  windowData: WindowData;
  isActive: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onMouseDown: () => void;
}

const WindowFrame = memo(function WindowFrame({ children, windowData, isActive, onMinimize, onMaximize, onClose, onMouseDown }: WindowFrameProps) {
  return (
    <div
      className={`flex flex-col w-full h-full ubuntu-window-bg rounded-t-xl shadow-2xl overflow-hidden ${isActive ? 'ring-2 ring-white/20' : ''}`}
      onMouseDown={onMouseDown}
    >
      {/* Title Bar Container */}
      <div className="bg-[#2C2C2C] h-10 flex items-center justify-between px-4 select-none border-b border-[#1E1E1E]">

        {/* Drag Handle Area - completely isolates dragging from the buttons! */}
        <div className="flex-1 flex justify-center items-center h-full window-drag-handle cursor-grab active:cursor-grabbing">
          <span className="text-white font-bold text-sm pointer-events-none">{windowData.title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2 cursor-default window-controls">
          <button
            onMouseDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <Minus className="w-4 h-4 text-white hover:text-white" />
          </button>
          <button
            onMouseDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-white hover:text-white" />
          </button>
          <button
            onMouseDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-orange-500 transition-colors group"
          >
            <X className="w-4 h-4 text-white hover:text-white" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto bg-white relative cursor-default">
        {children}
      </div>
    </div>
  );
});
