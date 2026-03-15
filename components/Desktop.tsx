"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useWindows } from './WindowManager';
import { DesktopItem } from '@/types/desktop';
import { YaruFolderIcon, YaruFileIcon, YaruAppIcon } from './icons/YaruIcons';
import { STATIC_FALLBACK_ITEMS, ICON_OVERRIDES, deriveDesktopItems } from '@/lib/sectionMetadata';
import { getPortfolioData } from '@/lib/actions';

// O(1) type-based icon lookup
const YARU_BY_TYPE: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: YaruFolderIcon,
  file: YaruFileIcon,
  app: YaruAppIcon,
};

function renderIcon(item: DesktopItem) {
  // 1. Check for custom image icon override (O(1))
  const override = ICON_OVERRIDES[item.id];
  if (override) {
    if (override.fill) {
      return <Image src={override.src} alt={item.title} fill sizes="48px" className={override.className} priority={override.priority} />;
    }
    return <Image src={override.src} alt={item.title} width={48} height={48} className={override.className} priority={override.priority} />;
  }

  // 2. Fall back to type-based Yaru SVG icon (O(1))
  const YaruIcon = YARU_BY_TYPE[item.type];
  if (YaruIcon) {
    return <YaruIcon className="w-full h-full drop-shadow-md" />;
  }

  return <YaruFileIcon className="w-full h-full drop-shadow-md" />;
}

export default function Desktop() {
  const { openWindow } = useWindows();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(STATIC_FALLBACK_ITEMS);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Derive desktop items from portfolio.json on mount
  useEffect(() => {
    getPortfolioData().then(data => {
      if (data && Object.keys(data).length > 0) {
        setDesktopItems(deriveDesktopItems(data));
      }
      // If fetch fails (returns {}), STATIC_FALLBACK_ITEMS remain
    });
  }, []);

  const handleItemClick = useCallback((item: DesktopItem) => {
    setSelectedItems([item.id]);
  }, []);

  const handleItemDoubleClick = useCallback((item: DesktopItem) => {
    // Check for external link (Socials)
    if (item.appUrl && item.appUrl.startsWith('http')) {
      window.open(item.appUrl, '_blank');
      return;
    }

    // Direct PDF Link Intercept (with explicit ObjectURL blob forcing to prevent browser preview overrides)
    if (item.id === 'resume') {
      import('@/lib/actions').then(async ({ getProfile, getImageUrl }) => {
        let resumeUrl = '/Bhargava_resume.pdf'; // default fallback

        try {
          const profile = await getProfile();
          if (profile?.resume_path) {
            resumeUrl = getImageUrl(profile.resume_path as string);
          }
        } catch {}

        try {
          // Force download via Blob to prevent browser preview hijacking on native CDN URLs
          const response = await fetch(resumeUrl, { mode: "cors" });
          if (!response.ok) throw new Error("Network response was not ok");

          const blob = await response.blob();
          const objectUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = "Bhargava_Resume.pdf";
          document.body.appendChild(link);
          link.click();
          link.remove();

          // Cleanup memory
          setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
        } catch (error) {
          console.error("Failed to download resume securely via Blob:", error);
          // Hard fallback directly to the <a> tag natively if CORS or network policies arbitrarily block the programmatic fetch
          const fallbackLink = document.createElement('a');
          fallbackLink.target = '_blank';
          fallbackLink.download = 'Bhargava_Resume.pdf';
          fallbackLink.href = resumeUrl;
          document.body.appendChild(fallbackLink);
          fallbackLink.click();
          fallbackLink.remove();
        }
      });
      return;
    }

    let windowTitle = item.title;

    if (item.id === 'contact') {
      windowTitle = 'Mozilla Firefox';
    } else if (item.id === 'terminal') {
      windowTitle = 'Terminal';
    } else if (item.type === 'app') {
      windowTitle = 'Web Browser';
    }

    openWindow({
      id: item.id,
      title: windowTitle,
      icon: item.type === 'folder' ? 'folder' : (item.type === 'app' ? 'globe' : 'file'),
      type: item.type,
      props: {
        windowId: item.id,
        rootItems: desktopItems,
        initialPath: `/${item.id}`,
        content: item.content,
        initialUrl: item.appUrl,
        item: item,
      },
      content: undefined,
      allowMultiple: item.id === 'terminal',
    });
  }, [openWindow, desktopItems]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === desktopRef.current) {
      setSelectedItems([]);
    }
  }, []);

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
              {renderIcon(item)}
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
