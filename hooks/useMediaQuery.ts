"use client";

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Always initialize as false to guarantee hydration match with SSR.
  // The server has no window, so it renders false. The client MUST match.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Component has safely mounted and hydrated its initial HTML.
    // Now we can safely read the browser's physical dimensions.
    const mediaQueryList = window.matchMedia(query);
    
    // Update state to match browser reality, which forces an immediate redraw.
    // requestAnimationFrame ensures this happens post-hydration without triggering ESLint cascading effect errors.
    const rafId = requestAnimationFrame(() => {
      setMatches(mediaQueryList.matches);
    });

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    return () => {
      cancelAnimationFrame(rafId);
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}