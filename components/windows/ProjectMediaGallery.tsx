"use client";

import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { MediaFacade, OptimizedVideo } from "@/components/common/MediaFacade";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  demoVideoUrl: string | null;
  screenshots: string[] | null;
  imageUrl: string | null;
  title: string;
}

// ─── Universal Embed URL Parser ───────────────────────────────────────────────
// Moved here from ProjectDetailView to keep all media logic in the async component

function getEmbedUrl(url: string): { type: "iframe" | "video"; src: string } {
  if (!url) return { type: "iframe", src: "" };

  if (url.endsWith(".mp4")) return { type: "video", src: url };

  const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytWatch[1]}` };

  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return { type: "iframe", src: `https://www.youtube.com/embed/${ytShort[1]}` };

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return { type: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview` };

  return { type: "iframe", src: url };
}

// ─── Media Section ────────────────────────────────────────────────────────────

function MediaSection({ src, type, title }: { src: string; type: "iframe" | "video"; title: string }) {
  if (type === "video") {
    return <OptimizedVideo src={src} title={title} />;
  }
  return <MediaFacade embedSrc={src} title={title} />;
}

// ─── Screenshot ───────────────────────────────────────────────────────────────

function Screenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-24 w-40 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/30">
      <ImageWithFallback
        fill
        src={src}
        alt={alt}
        className="object-cover"
        sizes="160px"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ProjectMediaGallery — Async Media Component
 *
 * This component is lazy-loaded and wrapped in a Suspense boundary.
 * All heavy operations (URL parsing, media rendering) happen here,
 * keeping the parent shell fast and non-blocking.
 *
 * FAANG Progressive Rendering Pattern:
 * - Parent renders text shell instantly
 * - Suspense shows skeleton while this component loads
 * - Media streams in without blocking text paint
 */
export default function ProjectMediaGallery({ demoVideoUrl, screenshots, title }: Props) {
  const media = demoVideoUrl ? getEmbedUrl(demoVideoUrl) : null;
  const screenshotList = Array.isArray(screenshots) ? screenshots.filter(Boolean) : [];

  // If no media at all, render nothing (Suspense fallback disappears cleanly)
  if (!media && screenshotList.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Primary media (video/embed) */}
      {media && (
        <div className="w-full bg-black">
          <MediaSection src={media.src} type={media.type} title={`${title} demo`} />
        </div>
      )}

      {/* Screenshots strip */}
      {screenshotList.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 py-4 border-b border-white/5">
          {screenshotList.map((s, i) => (
            <Screenshot key={i} src={s} alt={`${title} screenshot ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}