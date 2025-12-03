import { useState, useRef, useEffect } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useWindows, WindowData } from './WindowManager';
import { COMPONENT_REGISTRY } from './ComponentRegistry';

interface WindowProps {
  windowData: WindowData;
}

export default function Window({ windowData }: WindowProps) {
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

  // Strict Registry Check
  const ContentComponent = COMPONENT_REGISTRY[windowData.id];

  if (!ContentComponent && !windowData.content) {
    // Fallback only if explicitly provided in windowData (e.g. for simple alerts), otherwise Error
    // But user said "DO NOT fallback to <Home />".
    // If both are missing, render 404.
    return (
      <Rnd
        default={{
          x: windowData.position.x,
          y: windowData.position.y,
          width: windowData.size.width,
          height: windowData.size.height,
        }}
        className="z-50"
      >
        <div className="w-full h-full bg-red-500 text-white p-4 rounded">
          Error: Component not found for ID "{windowData.id}"
        </div>
      </Rnd>
    );
  }

  let Content = windowData.content;
  if (ContentComponent) {
    Content = <ContentComponent {...windowData.props} windowData={windowData} />;
  }

  // Handle Maximize State
  if (windowData.isMaximized) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ top: '28px', left: '64px', width: 'calc(100vw - 64px)', height: 'calc(100vh - 28px)' }}
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
      size={{ width: windowData.size.width, height: windowData.size.height }}
      position={{ x: windowData.position.x, y: windowData.position.y }}
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
      bounds="parent"
      className={`flex flex-col ${isActive ? 'z-50' : 'z-10'}`}
      dragHandleClassName="window-drag-handle"
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
}

function WindowFrame({ children, windowData, isActive, onMinimize, onMaximize, onClose, onMouseDown }: any) {
  return (
    <div
      className={`flex flex-col w-full h-full ubuntu-window-bg rounded-t-xl shadow-2xl overflow-hidden ${isActive ? 'ring-2 ring-white/20' : ''}`}
      onMouseDown={onMouseDown}
    >
      {/* Title Bar */}
      <div
        className="bg-[#2C2C2C] h-10 flex items-center justify-between px-4 select-none border-b border-[#1E1E1E] window-drag-handle cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1 flex justify-center">
          <span className="text-white font-bold text-sm">{windowData.title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:ubuntu-orange-bg transition-colors group"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto bg-white relative cursor-default">
        {children}
      </div>
    </div>
  );
}
