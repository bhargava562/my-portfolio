"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

const FACADE_TIMEOUT_MS = 5000;
const FALLBACK_POSTER = "/linux-placeholder.webp";

// ─── Thumbnail URL Extraction ─────────────────────────────────────────────────

/** Extract a high-quality thumbnail for YouTube videos. */
function getYouTubeThumbnail(embedSrc: string): string | null {
  const match = embedSrc.match(/youtube\.com\/embed\/([\w-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}

/** Extract thumbnail for Vimeo videos (uses Vimeo's oEmbed endpoint). */
function getVimeoThumbnail(embedSrc: string): string | null {
  const match = embedSrc.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (match) return `https://vumbnail.com/${match[1]}.jpg`;
  return null;
}

/** Resolve the best available thumbnail for a given embed URL. */
function resolveThumbnail(embedSrc: string, poster?: string): string {
  if (poster) return poster;
  return getYouTubeThumbnail(embedSrc) || getVimeoThumbnail(embedSrc) || FALLBACK_POSTER;
}

// ─── Play Button Overlay ──────────────────────────────────────────────────────

function PlayButton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-7 h-7 ml-1 text-gray-900"
        >
          <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

// ─── Media Facade Component ───────────────────────────────────────────────────

interface MediaFacadeProps {
  /** The full embed URL (YouTube /embed/, Vimeo /video/, Google Drive /preview) */
  embedSrc: string;
  /** Descriptive title for the iframe */
  title: string;
  /** Optional poster/thumbnail URL — auto-detected for YouTube/Vimeo */
  poster?: string;
  /** Additional CSS classes on the outer container */
  className?: string;
}

/**
 * Facade Pattern for heavy iframes.
 *
 * Initial state: Lightweight Next.js `<Image>` thumbnail with CSS-only play button.
 * On click:     Mounts the actual `<iframe>` (with autoplay where supported).
 * On unmount:   Nullifies iframe src to prevent ghost audio.
 * On timeout:   If iframe fails to load within 5s, shows "Media Unavailable".
 */
export function MediaFacade({ embedSrc, title, poster, className = "" }: MediaFacadeProps) {
  const [activated, setActivated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const thumbnailSrc = resolveThumbnail(embedSrc, poster);

  // Build the autoplay-enabled embed URL for YouTube (Drive doesn't support it)
  const autoplaySrc = embedSrc.includes("youtube.com/embed")
    ? `${embedSrc}${embedSrc.includes("?") ? "&" : "?"}autoplay=1`
    : embedSrc;

  // Timeout: if iframe hasn't loaded within 5s of activation, mark as failed
  useEffect(() => {
    if (!activated || loaded || failed) return;
    const timer = setTimeout(() => setFailed(true), FACADE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [activated, loaded, failed]);

  // Cleanup: nullify iframe src on unmount to prevent ghost audio
  useEffect(() => {
    const iframe = iframeRef.current;
    return () => {
      if (iframe) {
        try { iframe.src = "about:blank"; } catch {}
      }
    };
  }, []);

  const handleActivate = useCallback(() => {
    setActivated(true);
    setFailed(false);
    setLoaded(false);
  }, []);

  const containerClass = `relative w-full aspect-video bg-black overflow-hidden cursor-pointer group ${className}`;

  // ── Failed state ──
  if (activated && failed) {
    return (
      <div className={`${containerClass} cursor-default`}>
        <Image
          src={FALLBACK_POSTER}
          alt={`${title} — media unavailable`}
          fill
          className="object-contain"
          sizes="100vw"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="text-sm text-gray-400 bg-black/70 px-4 py-2 rounded-lg">
            Media unavailable
          </span>
          <button
            onClick={handleActivate}
            className="text-xs text-blue-400 hover:text-blue-300 bg-black/50 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Activated: show the actual iframe ──
  if (activated) {
    return (
      <div className={`${containerClass} cursor-default`}>
        {/* Loading spinner while iframe loads */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-900 flex items-center justify-center z-10">
            <div className="w-10 h-10 rounded-full border-2 border-gray-700 border-t-gray-400 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={autoplaySrc}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  // ── Default: lightweight thumbnail facade ──
  return (
    <div className={containerClass} onClick={handleActivate} role="button" tabIndex={0} aria-label={`Play ${title}`}>
      <Image
        src={thumbnailSrc}
        alt={`${title} thumbnail`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 70vw"
      />
      <PlayButton />
    </div>
  );
}

// ─── Optimized Video Player ───────────────────────────────────────────────────

interface OptimizedVideoProps {
  /** Direct URL to the video file (.mp4, .webm, etc.) */
  src: string;
  /** Descriptive title */
  title: string;
  /** Poster/thumbnail URL — falls back to /linux-placeholder.webp */
  poster?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Native HTML5 `<video>` with production optimizations:
 * - `preload="metadata"` — only downloads first few KBs (dimensions + duration)
 * - `poster` attribute — shows thumbnail before play
 * - Explicit pause + src cleanup on unmount to prevent ghost audio
 */
export function OptimizedVideo({ src, title, poster, className = "" }: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);



  // Cleanup: pause and release media buffer on unmount
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load(); // Release any buffered data
      }
    };
  }, []);

  if (!src || failed) {
    return (
      <div className={`relative w-full aspect-video bg-black ${className}`}>
        <Image
          src={FALLBACK_POSTER}
          alt={`${title} — media unavailable`}
          fill
          className="object-contain"
          sizes="100vw"
        />
        {failed && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <span className="text-xs text-gray-500 bg-black/60 px-3 py-1 rounded-full">
              Media unavailable
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      preload="metadata"
      poster={poster || FALLBACK_POSTER}
      className={`w-full aspect-video bg-black ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
