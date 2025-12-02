import { useState, useRef, useEffect } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useWindows, WindowData } from './WindowManager';

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
  } = useWindows();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const isActive = activeWindowId === windowData.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowData.isMaximized) return;
    
    setActiveWindow(windowData.id);
    setIsDragging(true);
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !windowData.isMaximized) {
        updateWindowPosition(windowData.id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, windowData.id, windowData.isMaximized, updateWindowPosition]);

  const windowStyle = windowData.isMaximized
    ? { left: 0, top: 28, right: 0, bottom: 0, width: '100%', height: 'calc(100% - 28px)' }
    : {
        left: windowData.position.x,
        top: windowData.position.y,
        width: windowData.size.width,
        height: windowData.size.height,
      };

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-auto"
      style={{
        ...windowStyle,
        zIndex: isActive ? 35 : 30,
      }}
      onMouseDown={() => setActiveWindow(windowData.id)}
    >
      <div className={`w-full h-full ubuntu-window-bg rounded-t-xl shadow-2xl flex flex-col overflow-hidden ${
        isActive ? 'ring-2 ring-white/20' : ''
      }`}>
        {/* Title Bar */}
        <div
          className="ubuntu-window-header-bg h-10 flex items-center justify-between px-4 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <span className="text-white">{windowData.title}</span>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => minimizeWindow(windowData.id)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => maximizeWindow(windowData.id)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => closeWindow(windowData.id)}
              className="w-8 h-8 flex items-center justify-center rounded hover:ubuntu-orange-bg transition-colors group"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-auto">
          {windowData.content}
        </div>
      </div>
    </motion.div>
  );
}
