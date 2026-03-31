"use client";

import React, { useMemo, memo } from 'react';
import { Home, Trash2, File, Globe } from 'lucide-react';
import Image from 'next/image';
import { useWindows } from './WindowManager';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface DockItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

export default memo(function ResponsiveNavigation() {
  const { openWindow, windows, minimizeWindow, activeWindowId, setActiveWindow } = useWindows();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Build dock items once, memoized
  const dockItems: DockItem[] = useMemo(() =>
    windows.map(w => {
      let Icon = File;
      if (w.type === 'folder') Icon = Home;
      if (w.type === 'app' && w.id !== 'terminal') Icon = Globe;

      return {
        id: w.id,
        icon: Icon,
        label: w.title,
      };
    }),
    [windows]
  );

  // O(1) Set build for window ID lookups
  const openWindowIds = useMemo(() => {
    const ids = new Set<string>();
    for (const w of windows) {
      if (!w.isMinimized) ids.add(w.id);
    }
    return ids;
  }, [windows]);

  const handleAppClick = (app: DockItem) => {
    const win = windows.find(w => w.id === app.id);
    if (!win) return;

    if (win.isMinimized) {
      openWindow({
        id: win.id,
        title: win.title,
        icon: win.icon,
        type: win.type,
        content: win.content,
        currentPath: win.currentPath,
        props: win.props,
      });
    } else if (activeWindowId === app.id) {
      minimizeWindow(app.id);
    } else {
      setActiveWindow(app.id);
    }
  };

  // Desktop layout: fixed left sidebar
  if (!isMobile) {
    return (
      <div className="fixed left-0 top-7 bottom-0 w-16 bg-[#2C001E]/90 backdrop-blur-md z-40 flex flex-col items-center py-2 border-r border-white/5">
        {/* App Icons */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar w-full items-center">
          {dockItems.map((app) => {
            const Icon = app.icon;
            const isOpen = openWindowIds.has(app.id);
            const isActive = activeWindowId === app.id;

            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="relative group"
              >
                {/* Running Indicator (Orange Dot) */}
                {isOpen && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#E95420] rounded-full" />
                )}

                {/* Icon */}
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-white/20' : (isOpen ? 'bg-white/5' : 'hover:bg-white/10')}`}>
                  {app.id === 'terminal' || app.id.startsWith('terminal-') ? (
                    <Image src="/terminal.webp" alt="Terminal" width={24} height={24} />
                  ) : app.id.startsWith('cert-viewer-') ? (
                    <Image src="/photos.webp" alt={app.label} width={24} height={24} className="rounded" />
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                  {app.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Trash at Bottom */}
        <button className="relative group mt-auto">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
            <Trash2 className="w-6 h-6 text-white" />
          </div>

          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
            Trash
          </div>
        </button>
      </div>
    );
  }

  // Mobile layout: fixed bottom navigation bar (Android-style)
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/70 backdrop-blur-md z-40 flex items-center justify-around px-2 border-t border-white/5">
      {dockItems.slice(0, 5).map((app) => {
        const Icon = app.icon;
        const isOpen = openWindowIds.has(app.id);
        const isActive = activeWindowId === app.id;

        return (
          <button
            key={app.id}
            onClick={() => handleAppClick(app)}
            className="flex flex-col items-center gap-1 p-2 relative"
          >
            {/* Running Indicator */}
            {isOpen && (
              <div className="absolute top-0 w-1.5 h-1.5 bg-[#E95420] rounded-full" />
            )}

            {/* Icon */}
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-white/20' : (isOpen ? 'bg-white/5' : 'hover:bg-white/10')}`}>
              {app.id === 'terminal' || app.id.startsWith('terminal-') ? (
                <Image src="/terminal.webp" alt="Terminal" width={20} height={20} />
              ) : app.id.startsWith('cert-viewer-') ? (
                <Image src="/photos.webp" alt={app.label} width={20} height={20} className="rounded" />
              ) : (
                <Icon className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Label on mobile */}
            <span className="text-xs text-white text-center line-clamp-1 pointer-events-none">
              {app.label.length > 8 ? app.label.slice(0, 8) : app.label}
            </span>
          </button>
        );
      })}

      {/* Trash on mobile */}
      <button className="flex flex-col items-center gap-1 p-2">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs text-white pointer-events-none">Trash</span>
      </button>
    </div>
  );
});
