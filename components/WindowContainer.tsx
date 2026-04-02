"use client";

import { useWindows } from './WindowManager';
import Window from './Window';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function WindowContainer() {
  const { windows } = useWindows();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Mobile: no padding (fullscreen windows), Desktop: offset for sidebar and topbar
  const containerStyle = isMobile
    ? { top: '0', left: '0' }
    : { top: '28px', left: '64px' };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      style={containerStyle}
      suppressHydrationWarning
    >
      {windows.map((window) => (
        !window.isMinimized && (
          <Window key={window.id} windowData={window} />
        )
      ))}
    </div>
  );
}
