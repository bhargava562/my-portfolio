"use client";

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useWindows } from './WindowManager';
import { DesktopItem } from '@/types/desktop';
import { YaruFolderIcon, YaruFileIcon, YaruAppIcon, YaruLinkedinIcon, YaruGithubIcon } from './icons/YaruIcons';

// Dynamic Imports with Loading Fallback
const AboutContent = dynamic(() => import('./windows/AboutContent'), {
  loading: () => <div className="flex items-center justify-center h-full text-white">Loading Content...</div>
});

export default function Desktop() {
  const { openWindow } = useWindows();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Desktop Items - These define what appears on the desktop and how they open
  const desktopItems: DesktopItem[] = [
    // About Me - Opens AboutContent
    {
      id: 'about',
      title: 'About Me',
      type: 'file',
      content: <AboutContent />,
    },
    // Resume - Opens TextEditor
    {
      id: 'resume',
      title: 'Resume.pdf',
      type: 'file',
      content: <div className="p-4">Resume Content Placeholder</div>,
    },
    // Skills - Opens SkillsContent
    {
      id: 'skills',
      title: 'Skills',
      type: 'folder',
      children: [],
    },
    // Experience - Opens ExperienceContent
    {
      id: 'experience',
      title: 'Experience',
      type: 'folder',
      children: [],
    },
    // Education - Opens EducationContent
    {
      id: 'education',
      title: 'Education',
      type: 'folder',
      children: [],
    },
    // Certifications - Opens CertificationsContent
    {
      id: 'certifications',
      title: 'Certifications',
      type: 'folder',
      children: [],
    },
    // Projects - Opens FileExplorer
    {
      id: 'projects',
      title: 'Projects',
      type: 'folder',
      children: [
        { id: 'proj-1', title: 'Project X', type: 'file', content: <div>Project X Details</div> },
      ],
    },
    // Socials Folder
    {
      id: 'socials',
      title: 'Socials',
      type: 'folder',
      children: [
        { id: 'linkedin', title: 'LinkedIn', type: 'file', appUrl: 'https://linkedin.com', metadata: { icon: 'linkedin' } },
        { id: 'github', title: 'GitHub', type: 'file', appUrl: 'https://github.com', metadata: { icon: 'github' } },
      ],
    },
    // Contact Me - Opens ContactForm
    {
      id: 'contact',
      title: 'Contact Me',
      type: 'app',
      appUrl: '/contact',
      metadata: { icon: 'globe' }
    },
  ];

  const handleItemClick = (item: DesktopItem) => {
    setSelectedItems([item.id]);
  };

  const handleItemDoubleClick = (item: DesktopItem) => {
    // Check for external link (Socials)
    if (item.appUrl && item.appUrl.startsWith('http')) {
      window.open(item.appUrl, '_blank');
      return;
    }

    // Direct PDF Link Intercept
    if (item.id === 'resume') {
      const link = document.createElement('a');
      link.href = '/Bhargava_Resume.pdf';
      link.download = 'Bhargava_Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    let content;
    let windowTitle = item.title;

    if (item.id === 'contact') {
      windowTitle = 'Mozilla Firefox';
    } else if (item.type === 'app') {
      windowTitle = 'Web Browser';
    }

    openWindow({
      id: item.id,
      title: windowTitle,
      icon: item.type === 'folder' ? 'folder' : (item.type === 'app' ? 'globe' : 'file'),
      type: item.type,
      props: {
        // Pass necessary props for the component
        windowId: item.id,
        rootItems: desktopItems,
        initialPath: `/${item.id}`,
        content: item.content, // For TextEditor fallback
        initialUrl: item.appUrl, // For Browser
        item: item, // For DetailView
      },
      content: content, // Keep for fallback/legacy support if Registry lookup fails
    });
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === desktopRef.current) {
      setSelectedItems([]);
    }
  };

  return (
    <div
      ref={desktopRef}
      className="absolute inset-0 z-0 p-4 grid grid-cols-[repeat(auto-fill,100px)] grid-rows-[repeat(auto-fill,100px)] gap-4 content-start"
      onClick={handleBackgroundClick}
      style={{
        paddingTop: '40px', // Space for TopBar
        paddingLeft: '80px', // Space for Dock
      }}
    >
      {desktopItems.map((item) => {
        const isSelected = selectedItems.includes(item.id);

        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleItemDoubleClick(item);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded border border-transparent transition-colors cursor-default
              ${isSelected ? 'bg-[rgba(233,84,32,0.4)] border-[rgba(233,84,32,0.6)]' : 'hover:bg-white/10'}
            `}
          >
            <div className="w-12 h-12 mb-1 relative flex items-center justify-center">
              {item.metadata?.icon === 'globe' ? (
                <Image src="/globe.svg" alt="Contact" width={48} height={48} priority />
              ) : item.id === 'resume' ? (
                <Image src="/resume.png" alt="Resume" fill className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rounded" />
              ) : (
                <>
                  {item.type === 'folder' && <YaruFolderIcon className="w-full h-full drop-shadow-md" />}
                  {item.type === 'file' && !item.metadata?.icon && <YaruFileIcon className="w-full h-full drop-shadow-md" />}
                  {item.type === 'app' && <YaruAppIcon className="w-full h-full drop-shadow-md" />}
                  {item.metadata?.icon === 'linkedin' && <YaruLinkedinIcon className="w-full h-full drop-shadow-md" />}
                  {item.metadata?.icon === 'github' && <YaruGithubIcon className="w-full h-full drop-shadow-md" />}
                </>
              )}
            </div>
            <span className={`text-sm text-center line-clamp-2 drop-shadow-md ${isSelected ? 'text-white' : 'text-white'}`}>
              {item.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
