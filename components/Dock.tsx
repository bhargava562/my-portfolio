"use client";

import { Home, User, Code, Briefcase, Trash2 } from 'lucide-react';
import { useWindows } from './WindowManager';
import AboutContent from './windows/AboutContent';
import ProjectsContent from './windows/ProjectsContent';
import SkillsContent from './windows/SkillsContent';
import HomeContent from './windows/HomeContent';

export default function Dock() {
  const { openWindow, isWindowOpen } = useWindows();

  const dockApps = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      content: <HomeContent />
    },
    {
      id: 'about',
      icon: User,
      label: 'About Me',
      content: <AboutContent />
    },
    {
      id: 'projects',
      icon: Code,
      label: 'Projects',
      content: <ProjectsContent />
    },
    {
      id: 'skills',
      icon: Briefcase,
      label: 'Skills',
      content: <SkillsContent />
    },
  ];

  return (
    <div className="fixed left-0 top-7 bottom-0 w-16 ubuntu-header-bg backdrop-blur-sm z-40 flex flex-col items-center py-4">
      {/* App Icons */}
      <div className="flex-1 flex flex-col gap-2">
        {dockApps.map((app) => {
          const Icon = app.icon;
          const isOpen = isWindowOpen(app.id);

          return (
            <button
              key={app.id}
              onClick={() => openWindow({
                id: app.id,
                title: app.label,
                icon: app.id,
                content: app.content,
              })}
              className="relative group"
            >
              {/* Active indicator */}
              {isOpen && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ubuntu-orange-bg rounded-r" />
              )}

              {/* Icon */}
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${isOpen
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
                }`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
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
