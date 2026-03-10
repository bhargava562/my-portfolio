"use client";

import { useEffect, useState } from 'react';
import { useBoot } from '@/hooks/useBootState';
import BootLoader from './BootLoader';
import LockScreen from './LockScreen';

export default function BootOverlay() {
  const { state, skipBoot, unlockDesktop } = useBoot();
  
  // Track mount states to enable css fade-out transitions before unmounting
  const [showBoot, setShowBoot] = useState(state === 'booting');
  const [showLock, setShowLock] = useState(state === 'booting' || state === 'locked');
  // Handle global overflow to prevent layout flash underneath bootloader
  useEffect(() => {
    if (state !== 'desktop') {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [state]);

  // Manage unmounting delays for smooth opacity transitions
  useEffect(() => {
    if (state === 'locked') {
      const lockTimer = setTimeout(() => setShowLock(true), 0);
      const timer = setTimeout(() => setShowBoot(false), 400); // Wait for fade-out
      return () => {
        clearTimeout(lockTimer);
        clearTimeout(timer);
      };
    }
    if (state === 'desktop') {
      const timer = setTimeout(() => setShowLock(false), 600); // Wait for blur/fade-out
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Once desktop is fully unlocked and animations finish, remove overlay entirely
  if (state === 'desktop' && !showLock && !showBoot) {
     return null;
  }

  return (
    <>
      {/* Lock Screen Layer */}
      {showLock && (
        <div 
          suppressHydrationWarning
          className={`fixed inset-0 z-[9998] transition-opacity duration-500 ease-in-out
            ${state === 'locked' || state === 'booting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <LockScreen onUnlock={unlockDesktop} />
        </div>
      )}

      {/* BootLoader Terminal Layer */}
      {showBoot && (
        <div 
          className={`fixed inset-0 z-[9999] transition-opacity duration-300 ease-in pointer-events-auto
            ${state === 'booting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <BootLoader onSkip={skipBoot} />
        </div>
      )}
    </>
  );
}
