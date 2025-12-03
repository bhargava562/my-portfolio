"use client";

import { Home, User, Code, Briefcase, Trash2, File, Globe } from 'lucide-react';
import { useWindows } from './WindowManager';

export default function Dock() {
  const { openWindow, isWindowOpen, windows, minimizeWindow, activeWindowId, setActiveWindow } = useWindows();

  interface DockItem {
    id: string;
    icon: any;
    label: string;
    isTemp?: boolean;
  }

  // Single Source of Truth: Only show running windows
  const dockItems: DockItem[] = windows.map(w => {
    let Icon = File;
    if (w.type === 'folder') Icon = Home;
    if (w.type === 'app') Icon = Globe;

    return {
      id: w.id,
      icon: Icon,
      label: w.title,
      isTemp: false
    };
  });

  const handleAppClick = (app: DockItem) => {
    const window = windows.find(w => w.id === app.id);
    if (!window) return;

    if (window.isMinimized) {
      // Restore
      const { isMinimized, isMaximized, position, size, ...rest } = window;
      openWindow(rest);
    } else if (activeWindowId === app.id) {
      // Minimize if already active
      minimizeWindow(app.id);
    } else {
      // Focus if open but not active
      setActiveWindow(app.id);
    }
  };

  return (
    <div className="fixed left-0 top-7 bottom-0 w-16 bg-[#2C001E]/90 backdrop-blur-md z-40 flex flex-col items-center py-2 border-r border-white/5">
      {/* App Icons */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar w-full items-center">
        {dockItems.map((app) => {
          const Icon = app.icon;
          const isOpen = isWindowOpen(app.id);
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
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-white/20' : (isOpen ? 'bg-white/5' : 'hover:bg-white/10')
                }`}>
                <Icon className="w-6 h-6 text-white" />
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
