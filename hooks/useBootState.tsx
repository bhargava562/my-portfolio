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
  const [state, setState] = useState<BootState>('booting');
  const [hydrated, setHydrated] = useState(false);
  const bootCompletedRef = useRef(false);

  useEffect(() => {
    // Avoid synchronous cascading render during initial paint
    setTimeout(() => setHydrated(true), 0);
    // Explicitly unhook the 0ms CSS fallback payload now that React has hydrated
    const fallback = document.getElementById('boot-fallback');
    if (fallback) fallback.remove();
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

    // Check session storage first to see if user already booted this session
    try {
      if (sessionStorage.getItem('bootCompleted') === 'true') {
        bootCompletedRef.current = true;
        // Wrapping in setTimeout prevents React's synchronous cascading render warning
        setTimeout(() => setState('locked'), 0);
        return;
      }
    } catch {
      // Ignored
    }

    // Deterministic timeout tracking explicit boot duration
    const bootTimer = setTimeout(() => {
      completeBoot();
    }, 4000);

    // Fail-safe maximum timeout of 8 seconds preventing infinite loading bounds
    const failsafe = setTimeout(() => {
      completeBoot();
    }, 8000);

    return () => {
      clearTimeout(bootTimer);
      clearTimeout(failsafe);
    };
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
