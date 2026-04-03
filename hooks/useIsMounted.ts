"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the component has mounted and finished its hydration pass.
 * Used for Zero-SSR and hydration guards.
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // We use a small deferment to ensure the React hydration 
    // baseline is finished before we signal success.
    const rafId = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  return isMounted;
}
