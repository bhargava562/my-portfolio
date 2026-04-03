"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, type PanInfo } from 'motion/react';
import { useWindows } from './WindowManager';
import { DesktopItem } from '@/types/desktop';
import { YaruFolderIcon, YaruFileIcon, YaruAppIcon } from './icons/YaruIcons';
import { STATIC_FALLBACK_ITEMS, ICON_OVERRIDES, deriveDesktopItems, SECTION_METADATA } from '@/lib/sectionMetadata';
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
    return (
      <Image
        src={override.src}
        alt={item.title}
        fill
        sizes="48px"
        className={`object-contain ${override.className || ''}`}
        priority={override.priority}
      />
    );
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
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Mobile detection for responsive layout
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Calculate dynamic items per page for mobile based on available height
  useEffect(() => {
    if (!isMobile) return;

    const calculateItemsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const topPadding = 20; // paddingTop from style
      const bottomReserved = 120; // Space for carousel dots + safety margin (bottom-24 = 96px + 24px buffer)
      const containerPadding = 16; // p-4 top/bottom
      
      // Actual item dimensions from the rendered component
      const itemHeight = 96; // h-24 = 96px
      const itemGap = 16; // gap-4 = 16px
      const itemWidth = 80; // w-20 = 80px
      const horizontalPadding = 32; // px-4 on both sides (16px each)
      
      const availableHeight = viewportHeight - topPadding - bottomReserved - containerPadding;
      const availableWidth = window.innerWidth - horizontalPadding;
      
      // Calculate rows and columns that fit (including gaps)
      const maxRows = Math.floor((availableHeight + itemGap) / (itemHeight + itemGap));
      const maxCols = Math.floor((availableWidth + itemGap) / (itemWidth + itemGap));
      
      // Ensure at least 2 rows and 3 columns, but cap at calculated max
      const rows = Math.max(2, Math.min(maxRows, 4)); // Cap at 4 rows for safety
      const cols = Math.max(3, maxCols);
      
      const calculated = rows * cols;
      
      setItemsPerPage(calculated);
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, [isMobile]);

  // Derive desktop items from portfolio.json on mount
  useEffect(() => {
    getPortfolioData().then(data => {
      if (data && Object.keys(data).length > 0) {
        setDesktopItems(deriveDesktopItems(data));
      }
      // If fetch fails (returns {}), STATIC_FALLBACK_ITEMS remain
    });
  }, []);

  // 1. Unified Filter for BOTH Mobile and Desktop
  const finalIconsToRender = useMemo(() => {
    // Destroys any resurrected localStorage items or mutated keys.
    return desktopItems.filter(item => {
      const id = (item.id || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      
      // The Nuclear Check: Destroy anything containing 'sync'
      if (id.includes('sync') || title.includes('sync')) return false;
      
      // The Metadata Check:
      if (SECTION_METADATA[id]?.isHidden) return false;
      
      // Exact Hardcoded Fallbacks:
      const IGNORED = ['profile', 'social_profiles', 'ui_config', 'schema', 'schema_migrations'];
      if (IGNORED.includes(id)) return false;

      return true;
    });
  }, [desktopItems]);

  // 2. Chunk items into pages for mobile (dynamic based on screen size)
  const pages = useMemo(() => {
    const perPage = isMobile ? itemsPerPage : 999; // Desktop shows all at once
    const chunks: DesktopItem[][] = [];
    for (let i = 0; i < finalIconsToRender.length; i += perPage) {
      chunks.push(finalIconsToRender.slice(i, i + perPage));
    }
    return chunks.length === 0 ? [[]] : chunks;
  }, [finalIconsToRender, itemsPerPage, isMobile]);

  // Extract common window-opening logic to avoid circular dependencies
  const openDesktopItem = useCallback((item: DesktopItem) => {
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

  const handleItemClick = useCallback((item: DesktopItem) => {
    setSelectedItems([item.id]);
    // On mobile: single tap opens the app instantly (better UX than double-click)
    // Double-click is unreliable on touch devices (browser may hijack for zooming)
    if (isMobile) {
      openDesktopItem(item);
      setSelectedItems([]); // Clear selection after opening
    }
  }, [isMobile, openDesktopItem]);

  const handleItemDoubleClick = useCallback((item: DesktopItem) => {
    openDesktopItem(item);
  }, [openDesktopItem]);

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
      {finalIconsToRender.map((item) => {
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