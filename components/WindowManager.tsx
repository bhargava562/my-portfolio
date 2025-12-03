"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { DesktopItemType } from '@/types/desktop';

export interface WindowData {
  id: string;
  title: string;
  icon: string;
  type: DesktopItemType;
  content: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  currentPath?: string; // For navigation
  props?: any; // Data to pass to the component
}

interface WindowContextType {
  windows: WindowData[];
  activeWindowId: string | null;
  openWindow: (window: Omit<WindowData, 'isMinimized' | 'isMaximized' | 'position' | 'size'>) => void;
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

  const openWindow = (windowData: Omit<WindowData, 'isMinimized' | 'isMaximized' | 'position' | 'size'>) => {
    // Check if window already exists
    const existingWindow = windows.find(w => w.id === windowData.id);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setWindows(prev => prev.map(w =>
          w.id === windowData.id ? { ...w, isMinimized: false } : w
        ));
      }
      setActiveWindowId(windowData.id);
      return;
    }

    const newWindow: WindowData = {
      ...windowData,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + windows.length * 30, y: 80 + windows.length * 30 },
      size: { width: 800, height: 600 },
      currentPath: windowData.currentPath || windowData.props?.initialPath || '/', // Default path
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const setActiveWindow = (id: string) => {
    setActiveWindowId(id);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size } : w
    ));
  };

  const navigateWindow = (id: string, path: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, currentPath: path } : w
    ));
  };

  const isWindowOpen = (id: string) => {
    return windows.some(w => w.id === id && !w.isMinimized);
  };

  return (
    <WindowContext.Provider value={{
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
    }}>
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
