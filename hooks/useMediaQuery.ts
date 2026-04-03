"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect media query matches (e.g., mobile, tablet breakpoints).
 * Returns false on SSR (server), then syncs client-side after hydration.
 * Safe for extension-injected attributes because it reads matchMedia, not DOM attrs.
 */
export function useMediaQuery(query: string): boolean {
  // Lazy initializer: read matchMedia only on client, false on server
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  const handleChange = useCallback((e: MediaQueryListEvent) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    // If the query changed, the initial lazy state may be stale.
    // Use requestAnimationFrame to avoid synchronous setState in effect body
    const rafId = requestAnimationFrame(() => {
      setMatches(mediaQueryList.matches);
    });

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      cancelAnimationFrame(rafId);
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query, handleChange]);

  return matches;
}