"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DesktopItemType } from '@/types/desktop';

const MAX_WINDOWS = 20;
const BASE_Z_INDEX = 10;

export interface WindowData {
  id: string;
  baseId: string; // Original ID for component lookup (e.g. 'terminal')
  title: string;
  icon: string;
  type: DesktopItemType;
  content: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  currentPath?: string; // For navigation
  props?: Record<string, unknown>; // Data to pass to the component
}

interface WindowContextType {
  windows: WindowData[];
  activeWindowId: string | null;
  openWindow: (window: Omit<WindowData, 'isMinimized' | 'isMaximized' | 'position' | 'size' | 'baseId' | 'zIndex'> & { allowMultiple?: boolean }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  navigateWindow: (id: string, path: string) => void;
  isWindowOpen: (id: string) => boolean;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(BASE_Z_INDEX + 1);

  const openWindow = useCallback((windowData: Omit<WindowData, 'isMinimized' | 'isMaximized' | 'position' | 'size' | 'baseId' | 'zIndex'> & { allowMultiple?: boolean }) => {
    setWindows(prev => {
      // Check if singleton window already exists
      if (!windowData.allowMultiple) {
        const existingWindow = prev.find(w => w.id === windowData.id);
        if (existingWindow) {
          if (existingWindow.isMinimized) {
            setActiveWindowId(windowData.id);
            return prev.map(w =>
              w.id === windowData.id ? { ...w, isMinimized: false } : w
            );
          }
          setActiveWindowId(windowData.id);
          return prev;
        }
      }

      // Enforce window limit
      if (prev.length >= MAX_WINDOWS) {
        return prev;
      }

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

      const padding = 80;
      const defaultWidth = Math.min(800, vw - padding);
      const defaultHeight = Math.min(600, vh - padding);

      const finalId = windowData.allowMultiple
        ? `${windowData.id}-${Math.random().toString(36).substr(2, 9)}`
        : windowData.id;

      // Modular stagger to cycle positions instead of linear overflow
      const staggerOffset = (prev.length % 10) * 30;
      const staggeredX = 100 + staggerOffset;
      const staggeredY = 80 + staggerOffset;
      const x = Math.max(10, Math.min(staggeredX, vw - defaultWidth - 10));
      const y = Math.max(10, Math.min(staggeredY, vh - defaultHeight - 10));

      // Derive z-index from the actual max across all windows so new windows
      // always appear in front, even after repeated setActiveWindow promotions
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), BASE_Z_INDEX);
      const newZ = maxZ + 1;

      const newWindow: WindowData = {
        ...windowData,
        id: finalId,
        baseId: windowData.id,
        isMinimized: false,
        isMaximized: false,
        position: { x, y },
        size: { width: defaultWidth, height: defaultHeight },
        zIndex: newZ,
        currentPath: windowData.currentPath || (windowData.props?.initialPath as string) || '/',
      };

      setActiveWindowId(newWindow.id);
      setNextZIndex(newZ + 1);
      return [...prev, newWindow];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    // BUG FIX #2: Check if this is a terminal window and explicitly clear its global state
    // (Don't rely on useEffect cleanup which would also fire on maximize/minimize)
    if (id.startsWith('terminal')) {
      import('@/lib/terminal/terminalStateStore').then(({ clearTerminalState }) => {
        clearTerminalState(id);
      });
    }

    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindowId(prev => prev === id ? null : prev);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    setActiveWindowId(prev => prev === id ? null : prev);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const setActiveWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setNextZIndex(prev => {
      const newZ = prev + 1;
      setWindows(ws => ws.map(w =>
        w.id === id ? { ...w, zIndex: newZ } : w
      ));
      return newZ;
    });
  }, []);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size } : w
    ));
  }, []);

  const navigateWindow = useCallback((id: string, path: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, currentPath: path } : w
    ));
  }, []);

  const isWindowOpen = useCallback((id: string) => {
    return windows.some(w => w.id === id && !w.isMinimized);
  }, [windows]);

  const contextValue = useMemo(() => ({
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize,
    navigateWindow,
    isWindowOpen,
  }), [windows, activeWindowId, openWindow, closeWindow, minimizeWindow, maximizeWindow, setActiveWindow, updateWindowPosition, updateWindowSize, navigateWindow, isWindowOpen]);

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within WindowProvider');
  }
  return context;
}
