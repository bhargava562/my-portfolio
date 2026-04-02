"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getSection } from "@/lib/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KnowledgeContext {
  id: string;
  context_role: string;
  entity_label: string;
  entity_type: string;
  knowledge_id: string;
  created_at: string;
}

interface KnowledgeNode {
  id: string;
  topic: string;
  problem_statement: string;
  engineering_solution: string;
  business_impact: string;
  technologies: string[];
  date_logged: string;
  display_order: number;
  created_at: string;
  contexts?: KnowledgeContext[];
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

function formatTimelineDate(iso: string) {
  const date = new Date(iso);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate(),
    year: date.getFullYear(),
  };
}

// ─── Timeline Article ─────────────────────────────────────────────────────────

function TimelineArticle({ item, isFirst, isLast }: { item: KnowledgeNode; isFirst?: boolean; isLast?: boolean }) {
  const dateInfo = formatTimelineDate(item.date_logged);

  return (
    <div className="relative flex gap-0">
      {/* Timeline Column - Container-responsive Width */}
      <div className="relative w-10 @sm:w-12 @md:w-16 @lg:w-20 @xl:w-24 flex-shrink-0">
        {/* Vertical Line Above */}
        {!isFirst && (
          <div className="absolute left-4 @sm:left-5 @md:left-8 @lg:left-10 @xl:left-12 top-0 w-[2px] h-5 @sm:h-6 @md:h-8 bg-gray-300" />
        )}

        {/* Date Badge */}
        <div className="absolute left-0 top-5 @sm:top-6 @md:top-8 w-10 @sm:w-12 @md:w-16 @lg:w-20 @xl:w-24 flex flex-col items-center">
          <div className="bg-white border-2 border-gray-300 rounded-sm px-0.5 @sm:px-1 @md:px-1.5 @lg:px-2 py-0.5 @sm:py-1 @md:py-1.5 text-center shadow-sm">
            <div className="text-[6px] @sm:text-[7px] @md:text-[8px] @lg:text-[9px] @xl:text-[10px] font-bold text-gray-500 tracking-wider">
              {dateInfo.month}
            </div>
            <div className="text-xs @sm:text-sm @md:text-lg @lg:text-xl @xl:text-2xl font-bold text-gray-800 leading-none">
              {dateInfo.day}
            </div>
            <div className="text-[6px] @sm:text-[7px] @md:text-[8px] @lg:text-[9px] @xl:text-[10px] text-gray-500">
              {dateInfo.year}
            </div>
          </div>
          {/* Timeline Dot */}
          <div className="w-1.5 @sm:w-2 @md:w-2.5 @lg:w-3 h-1.5 @sm:h-2 @md:h-2.5 @lg:h-3 bg-red-600 rounded-full mt-1 @sm:mt-1.5 @md:mt-2 border-2 border-white shadow-sm" />
        </div>

        {/* Vertical Line Below */}
        {!isLast && (
          <div className="absolute left-4 @sm:left-5 @md:left-8 @lg:left-10 @xl:left-12 bottom-0 w-[2px] h-full bg-gray-300" style={{ top: '80px' }} />
        )}
      </div>

      {/* Article Content */}
      <article className="flex-1 pb-4 @sm:pb-6 @md:pb-8 @lg:pb-12 pl-2 @sm:pl-2.5 @md:pl-4 @lg:pl-6 @xl:pl-8 border-l-2 border-gray-200">
        <div className="bg-white">
          {/* Byline */}
          <div className="mb-2 @sm:mb-3">
            <p className="text-[9px] @sm:text-[10px] @md:text-xs text-gray-500 uppercase tracking-wide">
              By <span className="font-semibold text-gray-700">Bhargava A.</span>
              {" "}| TNN |{" "}
              Updated: {formatDateline(item.date_logged)} IST
            </p>
          </div>

          {/* Headline - Business Impact */}
          <h2 className="font-serif text-sm @sm:text-base @md:text-xl @lg:text-2xl @xl:text-3xl font-bold text-gray-900 leading-tight mb-2 @sm:mb-3 @md:mb-4 hover:text-gray-700 transition-colors cursor-pointer">
            {item.business_impact}
          </h2>

          {/* Topic Category */}
          <div className="mb-3 @sm:mb-4">
            <span className="inline-block bg-red-600 text-white text-[9px] @sm:text-[10px] @md:text-xs font-bold uppercase tracking-wider px-1.5 @sm:px-2 @md:px-3 py-0.5 @sm:py-1">
              {item.topic}
            </span>
          </div>

          {/* Problem Statement Box */}
          <div className="bg-red-50 border-l-4 border-red-600 p-2 @sm:p-3 @md:p-4 mb-3 @sm:mb-4 @md:mb-5">
            <h3 className="text-[9px] @sm:text-[10px] @md:text-xs font-bold uppercase tracking-widest text-red-700 mb-1.5 @sm:mb-2">
              The Challenge
            </h3>
            <p className="text-xs @sm:text-sm @md:text-base text-gray-800 leading-relaxed">
              {item.problem_statement}
            </p>
          </div>

          {/* Engineering Solution */}
          <div className="mb-3 @sm:mb-4 @md:mb-5">
            <h3 className="text-[9px] @sm:text-[10px] @md:text-xs font-bold uppercase tracking-wide text-gray-700 mb-1.5 @sm:mb-2 pb-1 border-b-2 border-gray-300 inline-block">
              Engineering Solution
            </h3>
            <p className="text-xs @sm:text-sm @md:text-base text-gray-700 leading-relaxed mt-2 @sm:mt-3">
              {item.engineering_solution}
            </p>
          </div>

          {/* Technologies */}
          {item.technologies && item.technologies.length > 0 && (
            <div className="border-t border-gray-200 pt-2 @sm:pt-3 @md:pt-4 mb-3 @sm:mb-4 @md:mb-5">
              <h4 className="text-[9px] @sm:text-[10px] @md:text-xs font-bold uppercase tracking-widest text-gray-600 mb-1.5 @sm:mb-2 @md:mb-3">
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-1 @sm:gap-1.5 @md:gap-2">
                {item.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-[8px] @sm:text-[9px] @md:text-xs font-medium px-1.5 @sm:px-2 @md:px-3 py-0.5 @sm:py-1 border border-gray-300 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Where I Applied */}
          {item.contexts && item.contexts.length > 0 && (
            <div className="border-t border-gray-200 pt-2 @sm:pt-3 @md:pt-4">
              <h4 className="text-[9px] @sm:text-[10px] @md:text-xs font-bold uppercase tracking-widest text-gray-600 mb-1.5 @sm:mb-2 @md:mb-3">
                Where I Applied
              </h4>
              <div className="space-y-1 @sm:space-y-1.5 @md:space-y-2">
                {/* Remove duplicates by entity_label */}
                {Array.from(new Map(item.contexts.map(ctx => [ctx.entity_label, ctx])).values()).map((ctx) => (
                  <div key={ctx.id} className="flex items-start gap-1.5 @sm:gap-2">
                    <span className="inline-block w-0.5 h-0.5 @sm:w-1 @sm:h-1 bg-red-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-[9px] @sm:text-xs @md:text-sm text-gray-800">
                      <span className="font-semibold">{ctx.entity_label}</span>
                      <span className="text-gray-500 text-[8px] @sm:text-[9px] ml-1">({ctx.entity_type})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  items,
  onSelect,
}: {
  items: KnowledgeNode[];
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="sticky top-4">
      {/* Trending Section */}
      <div className="bg-white border border-gray-200 mb-3 @sm:mb-4 @md:mb-6">
        <div className="border-b-4 border-red-600 px-2 @sm:px-3 @md:px-4 py-2 @sm:py-2.5 @md:py-3">
          <h3 className="text-xs @sm:text-sm @md:text-base font-bold uppercase tracking-widest text-gray-900">
            Top Stories
          </h3>
        </div>
        <div className="p-2 @sm:p-3 @md:p-4">
          <ol className="space-y-2 @sm:space-y-2.5 @md:space-y-4">
            {items.slice(0, 5).map((item, i) => (
              <li key={item.id} className="flex gap-1.5 @sm:gap-2 @md:gap-3 items-start group">
                <span className="text-sm @sm:text-lg @md:text-xl font-bold text-red-600 leading-none w-6 shrink-0">
                  {i + 1}
                </span>
                <button
                  onClick={() => onSelect(item.id)}
                  className="text-[10px] @sm:text-xs @md:text-sm font-semibold text-gray-900 hover:text-red-600 cursor-pointer text-left leading-snug transition-colors"
                >
                  {item.business_impact}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 border border-gray-200 p-2 @sm:p-3 @md:p-4">
        <h4 className="text-[8px] @sm:text-[9px] @md:text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 @sm:mb-1.5 @md:mb-2">
          About This Section
        </h4>
        <p className="text-[8px] @sm:text-[9px] @md:text-[10px] text-gray-600 leading-relaxed">
          A curated collection of real-world engineering challenges and their technical solutions, documented in a professional news format.
        </p>
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AppliedKnowledgeContent() {
  const [all, setAll] = useState<KnowledgeNode[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const feedRef = useRef<HTMLDivElement>(null);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setVisibleCount(PAGE_SIZE);
  }, []);

  useEffect(() => {
    getSection("applied_knowledge").then((raw) => {
      const sorted = (raw as unknown as KnowledgeNode[])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.date_logged).getTime() - new Date(a.date_logged).getTime()
        );
      setAll(sorted);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (item) =>
        item.topic.toLowerCase().includes(q) ||
        item.problem_statement.toLowerCase().includes(q) ||
        item.engineering_solution.toLowerCase().includes(q) ||
        item.business_impact.toLowerCase().includes(q)
    );
  }, [all, query]);

  const visible = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

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
  const hasMore = visibleCount < filtered.length;

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
          Loading articles…
        </p>
      </div>
    );
  }

  return (
    <div
      ref={feedRef}
      className="flex-1 h-full bg-white overflow-y-auto applied-knowledge-scrollbar @container"
    >
      <div className="px-2 @sm:px-3 @md:px-4 @lg:px-6 py-2 @sm:py-3 @md:py-4 @lg:py-6 w-full">

        {/* ── Masthead ── */}
        <header className="mb-3 @sm:mb-4 @md:mb-6 @lg:mb-8 border-b-4 border-red-600 pb-2 @sm:pb-3 @md:pb-4 @lg:pb-6">
          <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-2 @sm:gap-3 @md:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-xl @sm:text-2xl @md:text-3xl @lg:text-4xl @xl:text-5xl font-bold text-gray-900 tracking-tight mb-1 @sm:mb-2">
                Applied Knowledge
              </h1>
              <p className="text-[9px] @sm:text-[10px] @md:text-xs @lg:text-sm text-gray-600 uppercase tracking-wider">
                Engineering Insights & Technical Dispatches
              </p>
            </div>

            {/* Search */}
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search..."
              className="border border-gray-300 px-2 @sm:px-3 @md:px-4 py-1 @sm:py-2 text-[10px] @sm:text-xs @md:text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-600 w-full @sm:w-auto @sm:min-w-[160px] @md:min-w-[200px] @lg:min-w-[240px] bg-white rounded"
            />
          </div>
        </header>

        {/* ── 2-Column Layout ── */}
        <div className="flex flex-col @lg:flex-row gap-3 @sm:gap-4 @md:gap-6 @lg:gap-8 @xl:gap-12">

          {/* Left: Timeline Feed (70%) */}
          <main className="w-full @lg:w-[68%]">
            {visible.length === 0 ? (
              <div className="text-center py-6 @sm:py-10 @md:py-12 @lg:py-16">
                <p className="text-xs @sm:text-sm @md:text-base text-gray-500 italic">
                  No articles match &ldquo;{query}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="relative">
                {visible.map((item, i) => (
                  <div
                    key={item.id}
                    ref={(el) => { articleRefs.current[item.id] = el; }}
                  >
                    <TimelineArticle 
                      item={item} 
                      isFirst={i === 0} 
                      isLast={i === visible.length - 1 && !hasMore}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div
              ref={sentinelRef}
              className="h-10 @sm:h-12 @md:h-14 @lg:h-16 flex items-center justify-center"
            >
              {loading && (
                <p className="font-sans text-[8px] @sm:text-[9px] @md:text-[10px] @lg:text-xs uppercase tracking-widest text-gray-400 animate-pulse">
                  Loading more articles…
                </p>
              )}
              {!hasMore && filtered.length > 0 && (
                <div className="flex flex-col items-center gap-1.5 @sm:gap-2 @md:gap-2.5 @lg:gap-3 py-3 @sm:py-4 @md:py-6 @lg:py-8">
                  <div className="h-px w-20 @sm:w-24 @md:w-28 @lg:w-32 bg-gray-300" />
                  <p className="font-sans text-[8px] @sm:text-[9px] @md:text-[10px] @lg:text-xs uppercase tracking-widest text-gray-500">
                    End of Timeline
                  </p>
                  <div className="h-px w-20 @sm:w-24 @md:w-28 @lg:w-32 bg-gray-300" />
                </div>
              )}
            </div>
          </main>

          {/* Right: Sidebar (30%) */}
          <div className="hidden @lg:block @lg:w-[32%]">
            <Sidebar items={trending} onSelect={scrollToArticle} />
          </div>
        </div>

        {/* Mobile: Sidebar below feed */}
        <div className="@lg:hidden mt-4 @sm:mt-6 @md:mt-8 @lg:mt-12 border-t-2 border-gray-200 pt-3 @sm:pt-4 @md:pt-6 @lg:pt-8">
          <Sidebar items={trending} onSelect={scrollToArticle} />
        </div>

      </div>
    </div>
  );
}
