import React, { memo } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { motion } from 'motion/react';
import { useWindows, WindowData } from './WindowManager';
import { getComponent } from './ComponentRegistry';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  // BUG FIX #3: Pass the unique windowId to terminal (and other multi-instance components)
  // so they use the correct isolated store key
  return <Component {...windowData.props} windowData={windowData} windowId={windowData.id} />;
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

  // Mobile detection: forces fullscreen, disables dragging/resizing
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isActive = activeWindowId === windowData.id;

  const Content = windowData.content ?? <RegistryContent windowData={windowData} />;

  // Mobile: Force fullscreen and disable dragging/resizing
  if (isMobile) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 flex flex-col pointer-events-auto z-50"
        style={{
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: windowData.zIndex,
        }}
        suppressHydrationWarning
      >
        <WindowFrame
          windowData={windowData}
          isActive={isActive}
          onMinimize={() => minimizeWindow(windowData.id)}
          onMaximize={() => maximizeWindow(windowData.id)}
          onClose={() => closeWindow(windowData.id)}
          onMouseDown={() => setActiveWindow(windowData.id)}
          isMobile={true}
        >
          {Content}
        </WindowFrame>
      </motion.div>
    );
  }

  // Handle Maximize State (desktop only)
  if (windowData.isMaximized) {
    return (
      <div
        className="fixed inset-0 flex flex-col pointer-events-auto"
        style={{ top: '28px', left: '64px', width: 'calc(100vw - 64px)', height: 'calc(100vh - 28px)', zIndex: windowData.zIndex }}
        suppressHydrationWarning
      >
        <WindowFrame
          windowData={windowData}
          isActive={isActive}
          onMinimize={() => minimizeWindow(windowData.id)}
          onMaximize={() => maximizeWindow(windowData.id)}
          onClose={() => closeWindow(windowData.id)}
          onMouseDown={() => setActiveWindow(windowData.id)}
          isMobile={false}
        >
          {Content}
        </WindowFrame>
      </div>
    );
  }

  // Desktop: draggable and resizable window
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
        isMobile={false}
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
  isMobile: boolean;
}

const WindowFrame = memo(function WindowFrame({ children, windowData, isActive, onMinimize, onMaximize, onClose, onMouseDown, isMobile }: WindowFrameProps) {
  return (
    <div
      className={`flex flex-col w-full h-full ubuntu-window-bg rounded-t-xl shadow-2xl overflow-hidden ${isMobile ? '' : (isActive ? 'ring-2 ring-white/20' : '')}`}
      onMouseDown={onMouseDown}
    >
      {/* Title Bar Container */}
      <div className={`${isMobile ? 'bg-[#1a1a1a]' : 'bg-[#2C2C2C]'} h-10 flex items-center justify-between px-4 select-none border-b border-[#1E1E1E]`}>
        {/* Drag Handle Area - Mobile: only close button visible */}
        <div className={`flex-1 flex ${isMobile ? 'justify-start' : 'justify-center'} items-center h-full ${!isMobile ? 'window-drag-handle' : ''} ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          <span className="text-white font-bold text-sm pointer-events-none">{windowData.title}</span>
        </div>

        {/* Window Controls - Simplified on mobile */}
        <div className="flex items-center gap-2 cursor-default window-controls">
          {!isMobile && (
            <>
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
            </>
          )}
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
