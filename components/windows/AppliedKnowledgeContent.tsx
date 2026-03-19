"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getSection } from "@/lib/actions";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LearningNode {
  id: string;
  title: string;
  concept_learned: string;
  previous_approach: string | null;
  improved_approach: string | null;
  adaptation_reason: string | null;
  date_learned: string;
  image_path: string | null;  // Supabase storage path, e.g. "learned/ai.webp"
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Constructs full Supabase Storage URL from a relative path.
 * Uses NEXT_PUBLIC_SUPABASE_STORAGE_URL and NEXT_PUBLIC_SUPABASE_BUCKET env vars.
 *
 * URL structure: {STORAGE_URL}{BUCKET}/{path}
 * Example: https://xxx.supabase.co/storage/v1/object/public/learned/ai.webp
 *
 * @param path - Relative storage path (e.g., "learned/ai.webp")
 * @returns Full public URL or null if path is empty/invalid
 */
function getStorageUrl(path: string | null | undefined): string | null {
  if (!path || path.trim() === "") return null;

  // Already a full URL or local path - return as-is
  if (path.startsWith("http") || path.startsWith("/")) {
    return path;
  }

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "public";

  if (!storageUrl) {
    console.warn("[AppliedKnowledge] NEXT_PUBLIC_SUPABASE_STORAGE_URL not set");
    return null;
  }

  // Ensure trailing slash on storage URL
  const baseUrl = storageUrl.endsWith("/") ? storageUrl : `${storageUrl}/`;
  // Remove leading slash from path if present
  const safePath = path.startsWith("/") ? path.slice(1) : path;

  return `${baseUrl}${bucket}/${safePath}`;
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ item, isHero }: { item: LearningNode; isHero?: boolean }) {
  const imgSrc = getStorageUrl(item.image_path);

  return (
    <article className={`pb-8 mb-8 border-b-2 border-gray-200 ${isHero ? "" : ""}`}>
      {/* Dateline */}
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
        By <span className="font-semibold text-gray-700">Bhargava A.</span>
        {" "}| TNN |{" "}
        Updated: {formatDateline(item.date_learned)} IST
      </p>

      {/* Headline */}
      <h2
        className={`font-serif font-bold leading-tight text-black mb-3 ${
          isHero ? "text-4xl" : "text-3xl"
        }`}
      >
        {item.title}
      </h2>

      {/* Key Takeaways */}
      {(item.improved_approach || item.adaptation_reason) && (
        <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#d32f2f] mb-2">
            Key Takeaways
          </p>
          <ul className="list-disc ml-5 space-y-1">
            {item.improved_approach && (
              <li className="text-sm font-medium text-gray-800">
                {item.improved_approach}
              </li>
            )}
            {item.adaptation_reason && (
              <li className="text-sm font-medium text-gray-800">
                {item.adaptation_reason}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* TOI-Style Image with Caption */}
      {imgSrc && (
        <figure className="mb-6">
          <div className="relative w-full aspect-video overflow-hidden border border-gray-200 bg-gray-50">
            <ImageWithFallback
              fill
              src={imgSrc}
              alt={item.title}
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>
          <figcaption className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 mb-4 text-right border-b border-gray-100 pb-2">
            {item.title} — TNN File Photo
          </figcaption>
        </figure>
      )}

      {/* Body */}
      <p className="text-lg text-[#333] leading-relaxed mb-4">
        {item.concept_learned}
      </p>
      {item.previous_approach && (
        <p className="text-lg text-[#333] leading-relaxed mb-4 italic">
          <span className="not-italic font-semibold text-gray-600">Previous approach: </span>
          {item.previous_approach}
        </p>
      )}
    </article>
  );
}

// ─── Trending Sidebar ─────────────────────────────────────────────────────────

function TrendingSidebar({
  items,
  onSelect,
}: {
  items: LearningNode[];
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="sticky top-4">
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-widest border-b-4 border-red-600 pb-1 inline-block text-[#111]">
          Trending
        </span>
      </div>
      <ol className="space-y-4">
        {items.slice(0, 5).map((item, i) => (
          <li key={item.id} className="flex gap-3 items-start">
            <span className="text-xl font-bold text-[#d32f2f] leading-none w-5 shrink-0">
              {i + 1}
            </span>
            <button
              onClick={() => onSelect(item.id)}
              className="text-sm font-bold text-[#111] hover:text-red-600 cursor-pointer text-left leading-snug transition-colors"
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
          About This Section
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          A curated log of technical concepts mastered through real-world application — formatted as a live editorial dispatch.
        </p>
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AppliedKnowledgeContent() {
  const [all, setAll] = useState<LearningNode[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSection("learnings").then((raw) => {
      const sorted = (raw as unknown as LearningNode[])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.date_learned).getTime() - new Date(a.date_learned).getTime()
        );
      setAll(sorted);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.concept_learned.toLowerCase().includes(q)
    );
  }, [all, query]);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoading(false);
    }, 400);
  }, [loading]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = visibleCount < filtered.length;

  // Trending: top 5 most recent from full unfiltered list
  const trending = useMemo(() => all.slice(0, 5), [all]);

  const scrollToArticle = useCallback((id: string) => {
    const el = articleRefs.current[id];
    if (el && feedRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (all.length === 0) {
    return (
      <div className="flex-1 h-full bg-white flex items-center justify-center">
        <p className="font-sans text-xs uppercase tracking-widest text-gray-400">
          Loading dispatches…
        </p>
      </div>
    );
  }

  return (
    <div
      ref={feedRef}
      className="flex-1 h-full bg-white overflow-y-auto applied-knowledge-scrollbar"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Masthead ── */}
        <header className="mb-6">
          <div className="h-[3px] bg-[#d32f2f] mb-1" />
          <div className="h-px bg-[#111] mb-4" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-[#111] uppercase">
                Applied Knowledge
              </h1>
              <div className="w-16 h-[3px] bg-[#d32f2f] mt-1" />
            </div>

            {/* Search */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#d32f2f] w-full sm:w-64 bg-white"
            />
          </div>

          <div className="h-px bg-gray-300 mt-4" />
        </header>

        {/* ── 2-Column Layout ── */}
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left: Main Feed (70%) */}
          <main className="w-full md:w-[70%]">
            {visible.length === 0 ? (
              <p className="text-sm text-gray-400 italic mt-8">
                No articles match &ldquo;{query}&rdquo;.
              </p>
            ) : (
              visible.map((item, i) => (
                <div
                  key={item.id}
                  ref={(el) => { articleRefs.current[item.id] = el; }}
                >
                  <ArticleCard item={item} isHero={i === 0 && !query} />
                </div>
              ))
            )}

            {/* Infinite scroll sentinel */}
            <div
              ref={sentinelRef}
              className="h-10 flex items-center justify-center mt-2"
            >
              {loading && (
                <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400 animate-pulse">
                  Loading more…
                </p>
              )}
              {!hasMore && filtered.length > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-px w-16 bg-gray-300" />
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400">
                    End of record
                  </p>
                  <div className="h-px w-16 bg-gray-300" />
                </div>
              )}
            </div>
          </main>

          {/* Right: Sidebar (30%) — hidden on mobile, stacks below on md */}
          <div className="hidden md:block md:w-[30%]">
            <TrendingSidebar items={trending} onSelect={scrollToArticle} />
          </div>
        </div>

        {/* Mobile: Trending below feed */}
        <div className="md:hidden mt-8 border-t-2 border-gray-200 pt-6">
          <TrendingSidebar items={trending} onSelect={scrollToArticle} />
        </div>

      </div>
    </div>
  );
}
