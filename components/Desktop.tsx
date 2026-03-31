"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, type PanInfo } from 'motion/react';
import { useWindows } from './WindowManager';
import { DesktopItem } from '@/types/desktop';
import { YaruFolderIcon, YaruFileIcon, YaruAppIcon } from './icons/YaruIcons';
import { STATIC_FALLBACK_ITEMS, ICON_OVERRIDES, deriveDesktopItems } from '@/lib/sectionMetadata';
import { getPortfolioData } from '@/lib/actions';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  const [currentPage, setCurrentPage] = useState(0);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Mobile detection for responsive layout
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Derive desktop items from portfolio.json on mount
  useEffect(() => {
    getPortfolioData().then(data => {
      if (data && Object.keys(data).length > 0) {
        setDesktopItems(deriveDesktopItems(data));
      }
      // If fetch fails (returns {}), STATIC_FALLBACK_ITEMS remain
    });
  }, []);

  // Chunk items into pages for mobile (12 items per page, 3x4 grid)
  const itemsPerPage = isMobile ? 12 : 999; // Desktop shows all at once
  const pages = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < desktopItems.length; i += itemsPerPage) {
      chunks.push(desktopItems.slice(i, i + itemsPerPage));
    }
    return chunks.length === 0 ? [[]] : chunks;
  }, [desktopItems, itemsPerPage]);

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

  // Handle swipe/drag end for mobile carousel
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobile) return;

    // Detect swipe velocity and offset
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 500;

    const isSwipeLeft = info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocityThreshold;
    const isSwipeRight = info.offset.x > swipeThreshold || info.velocity.x > swipeVelocityThreshold;

    if (isSwipeLeft && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (isSwipeRight && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [isMobile, currentPage, pages.length]);

  if (isMobile) {
    return (
      <div
        ref={desktopRef}
        className="absolute inset-0 z-0 flex flex-col items-center justify-start p-4"
        onClick={handleBackgroundClick}
        style={{
          paddingTop: '20px',
        }}
      >
        {/* Swipeable App Carousel */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -300, right: 300 }}
          onDragEnd={handleDragEnd}
          animate={{ x: -currentPage * 100 + '%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex w-full"
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              className="w-full flex-shrink-0 flex flex-wrap justify-center gap-4 content-start px-4"
            >
              {page.map((item) => {
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
                    className={`w-20 h-24 flex flex-col items-center justify-start pt-2 px-1 rounded border border-transparent transition-colors cursor-default
                      ${isSelected ? 'bg-[rgba(233,84,32,0.4)] border-[rgba(233,84,32,0.6)]' : 'hover:bg-white/10'}
                    `}
                  >
                    <div className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center">
                      {renderIcon(item)}
                    </div>
                    <span className="mt-1 text-xs text-white text-center leading-tight line-clamp-2 drop-shadow-md w-full break-words">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>

        {/* Page Dots Indicator (Android-style) */}
        {pages.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
            {pages.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage ? 'bg-[#E95420] w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout: static grid with all items
  return (
    <div
      ref={desktopRef}
      className="absolute inset-0 z-0 p-4 grid grid-cols-[repeat(auto-fill,100px)] gap-x-4 gap-y-4 content-start items-start"
      onClick={handleBackgroundClick}
      style={{
        paddingTop: '40px', // Space for TopBar
        paddingLeft: '80px', // Space for Sidebar
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
            className={`w-[100px] h-[104px] flex flex-col items-center justify-start pt-2 px-1 rounded border border-transparent transition-colors cursor-default
              ${isSelected ? 'bg-[rgba(233,84,32,0.4)] border-[rgba(233,84,32,0.6)]' : 'hover:bg-white/10'}
            `}
          >
            <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center">
              {renderIcon(item)}
            </div>
            <span className="mt-1 text-sm text-white text-center leading-tight line-clamp-2 drop-shadow-md w-full break-words">
              {item.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
