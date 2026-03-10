"use client";

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';

type BootState = 'booting' | 'locked' | 'desktop';

interface BootContextType {
  state: BootState;
  skipBoot: () => void;
  unlockDesktop: () => void;
  lockDesktop: () => void;
}

const BootContext = createContext<BootContextType | undefined>(undefined);

export const BootProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always start as 'booting' for SSR consistency (prevents hydration mismatch)
  const [state, setState] = useState<BootState>('booting');
  const [hydrated, setHydrated] = useState(false);
  const bootCompletedRef = useRef(false);

  // Hydration effect: runs once on client mount, before boot sequence
  useEffect(() => {
    // Check sessionStorage to skip boot on refresh
    try {
      if (sessionStorage.getItem('bootCompleted') === 'true') {
        setState('locked');
        bootCompletedRef.current = true;
      }
    } catch {}

    // Remove the static fallback element
    const fallback = document.getElementById('boot-fallback');
    if (fallback) fallback.remove();

    // Signal hydration complete (triggers boot sequence effect)
    setHydrated(true);
  }, []);

  const completeBoot = useCallback(() => {
    if (bootCompletedRef.current) return;
    bootCompletedRef.current = true;
    
    try {
      sessionStorage.setItem('bootCompleted', 'true');
    } catch {}
    
    // Only transition to locked if we are still actively booting
    // This prevents timeouts from ripping the user out of the desktop back into the lock screen
    setState(prev => prev === 'booting' ? 'locked' : prev);
  }, []);

  useEffect(() => {
    // Block logical execution entirely until React has hydrated listeners
    if (!hydrated) return;

    // If we are already past booting (e.g. sessionStorage said 'locked'), 
    // just fire background prefetch and exit. Do NOT re-run boot sequence.
    if (state !== 'booting') {
      // Background prefetch even on immediate lock return
      import('@/lib/actions').then(({ getPortfolioData, getUiConfigData }) => {
          getPortfolioData();
          getUiConfigData();
      });
      return;
    }

    // Dynamic Data Prime Sequence (only runs on fresh boot)
    import('@/lib/actions').then(({ getPortfolioData, getUiConfigData, getImageUrl }) => {
       const dataPromise = getPortfolioData();
       const uiPromise = getUiConfigData();
       
       Promise.all([dataPromise, uiPromise]).then(([portfolioData]) => {
          // Preload critical images in the background (non-blocking)
          const profile = portfolioData?.profile as Record<string, string> | undefined;
          if (profile?.profile_image_path) {
              const img = new window.Image();
              img.src = getImageUrl(profile.profile_image_path);
          }
          if (profile?.banner_path) {
              const img = new window.Image();
              img.src = getImageUrl(profile.banner_path);
          }
          
          // Proceed to desktop immediately after data is ready 
          // (Adding a tiny 1500ms guaranteed minimum so the GRUB boot animation doesn't visually glitch completely instantly)
          setTimeout(() => {
             completeBoot();
          }, 1500);
       }).catch(() => {
          setTimeout(() => completeBoot(), 1500);
       });
    });

    // Fail-safe maximum timeout of 8 seconds preventing infinite loading bounds
    const failsafe = setTimeout(() => {
      completeBoot();
    }, 8000);

    return () => {
      clearTimeout(failsafe);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, completeBoot]);

  const skipBoot = () => {
    completeBoot();
  };

  const unlockDesktop = () => {
    setState('desktop');
  };

  const lockDesktop = () => {
    setState('locked');
  };

  return (
    <BootContext.Provider value={{ state, skipBoot, unlockDesktop, lockDesktop }}>
      {children}
    </BootContext.Provider>
  );
}

export function useBoot() {
  const context = useContext(BootContext);
  if (!context) {
    throw new Error('useBoot must be used within a BootProvider');
  }
  return context;
}
