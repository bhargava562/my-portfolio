"use client";

import { useWindows } from './WindowManager';
import Window from './Window';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function WindowContainer() {
  const { windows } = useWindows();
  const isMounted = useIsMounted();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // ZERO-SSR: Return null on server and initial hydration pass
  if (!isMounted) {
    return null;
  }

  // Mobile: no padding (fullscreen windows), Desktop: offset for sidebar and topbar (28px top, 64px left)
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