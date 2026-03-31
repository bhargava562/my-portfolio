"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches (e.g., mobile, tablet breakpoints).
 * Returns false on SSR (server), then syncs client-side after hydration.
 * Safe for extension-injected attributes because it reads matchMedia, not DOM attrs.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure we only run on client after hydration
    setIsMounted(true);

    const mediaQueryList = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern browsers: addEventListener
    mediaQueryList.addEventListener('change', handler);

    return () => {
      mediaQueryList.removeEventListener('change', handler);
    };
  }, [query]);

  // Return false during SSR, true/false after hydration
  return isMounted && matches;
}
