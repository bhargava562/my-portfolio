"use client";

import { FileText, Folder, Mail } from 'lucide-react';
import { useWindows } from './WindowManager';
import { useState } from 'react';
import ContextMenu from './ContextMenu';

interface DesktopIcon {
  id: string;
  label: string;
  icon: 'file' | 'folder' | 'mail';
  type: 'file' | 'folder';
  action?: () => void;
}

export default function Desktop() {
  const { openWindow } = useWindows();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const desktopIcons: DesktopIcon[] = [
    {
      id: 'resume',
      label: 'Resume.pdf',
      icon: 'file',
      type: 'file',
      action: () => {
        openWindow({
          id: 'resume-viewer',
          title: 'Resume.pdf',
          icon: 'file',
          content: (
            <div className="p-6 text-white">
              <h2 className="mb-4">John Doe - Software Engineer</h2>
              <div className="space-y-4">
                <section>
                  <h3 className="ubuntu-orange mb-2">Experience</h3>
                  <div className="space-y-2">
                    <div>
                      <div>Senior Frontend Developer @ Tech Corp</div>
                      <div className="text-sm text-gray-400">2021 - Present</div>
                      <p className="text-sm mt-1">Leading development of enterprise web applications using React and TypeScript.</p>
                    </div>
                    <div>
                      <div>Full Stack Developer @ StartupXYZ</div>
                      <div className="text-sm text-gray-400">2019 - 2021</div>
                      <p className="text-sm mt-1">Built scalable web applications with Node.js and React.</p>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="ubuntu-orange mb-2">Education</h3>
                  <div>
                    <div>B.S. Computer Science</div>
                    <div className="text-sm text-gray-400">University of Technology, 2019</div>
                  </div>
                </section>
              </div>
            </div>
          ),
        });
      },
    },
    {
      id: 'projects',
      label: 'Project_Links',
      icon: 'folder',
      type: 'folder',
      action: () => {
        openWindow({
          id: 'projects',
          title: 'Projects',
          icon: 'projects',
          content: <div className="p-6 text-white">Projects folder content here</div>,
        });
      },
    },
    {
      id: 'email',
      label: 'Email_Me',
      icon: 'mail',
      type: 'file',
      action: () => {
        window.location.href = 'mailto:your.email@example.com';
      },
    },
  ];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'file':
        return <FileText className="w-12 h-12" />;
      case 'folder':
        return <Folder className="w-12 h-12 text-orange-500" />;
      case 'mail':
        return <Mail className="w-12 h-12" />;
      default:
        return <FileText className="w-12 h-12" />;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        className="absolute top-7 left-16 right-0 bottom-0 p-8"
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      >
        <div className="grid grid-cols-[repeat(auto-fill,100px)] gap-6 content-start">
          {desktopIcons.map((icon) => (
            <button
              key={icon.id}
              onDoubleClick={icon.action}
              className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 transition-colors group"
            >
              <div className="text-white drop-shadow-lg">
                {getIcon(icon.icon)}
              </div>
              <span className="text-white text-sm text-center drop-shadow-lg">
                {icon.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
