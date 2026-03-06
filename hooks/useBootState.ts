"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

type BootState = 'booting' | 'locked' | 'desktop';

export function useBootState() {
  const [state, setState] = useState<BootState>('booting');
  const bootCompletedRef = useRef(false);

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

    // Single deterministic timeout to execute Boot completion
    const bootTimer = setTimeout(() => {
      completeBoot();
    }, 4000);

    return () => {
      clearTimeout(bootTimer);
    };
  }, [completeBoot]);

  const skipBoot = () => {
    completeBoot();
  };

  const unlockDesktop = () => {
    setState('desktop');
  };

  return { state, skipBoot, unlockDesktop };
}
