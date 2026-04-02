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
      {/* Timeline Column - Fixed Width */}
      <div className="relative w-16 sm:w-20 md:w-24 flex-shrink-0">
        {/* Vertical Line Above */}
        {!isFirst && (
          <div className="absolute left-8 sm:left-10 md:left-12 top-0 w-[2px] h-8 bg-gray-300" />
        )}
        
        {/* Date Badge */}
        <div className="absolute left-0 top-8 w-16 sm:w-20 md:w-24 flex flex-col items-center">
          <div className="bg-white border-2 border-gray-300 rounded-sm px-1.5 sm:px-2 py-1 sm:py-1.5 text-center shadow-sm">
            <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-wider">
              {dateInfo.month}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800 leading-none">
              {dateInfo.day}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500">
              {dateInfo.year}
            </div>
          </div>
          {/* Timeline Dot */}
          <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-red-600 rounded-full mt-2 border-2 border-white shadow-sm" />
        </div>
        
        {/* Vertical Line Below */}
        {!isLast && (
          <div className="absolute left-8 sm:left-10 md:left-12 bottom-0 w-[2px] h-full bg-gray-300" style={{ top: '100px' }} />
        )}
      </div>

      {/* Article Content */}
      <article className="flex-1 pb-8 sm:pb-12 pl-4 sm:pl-6 md:pl-8 border-l-2 border-gray-200">
        <div className="bg-white">
          {/* Byline */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              By <span className="font-semibold text-gray-700">Bhargava A.</span>
              {" "}| TNN |{" "}
              Updated: {formatDateline(item.date_logged)} IST
            </p>
          </div>

          {/* Headline - Business Impact */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4 hover:text-gray-700 transition-colors cursor-pointer">
            {item.business_impact}
          </h2>

          {/* Topic Category */}
          <div className="mb-4">
            <span className="inline-block bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1">
              {item.topic}
            </span>
          </div>

          {/* Problem Statement Box */}
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-700 mb-2">
              The Challenge
            </h3>
            <p className="text-base text-gray-800 leading-relaxed">
              {item.problem_statement}
            </p>
          </div>

          {/* Engineering Solution */}
          <div className="mb-5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-2 pb-1 border-b-2 border-gray-300 inline-block">
              Engineering Solution
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mt-3">
              {item.engineering_solution}
            </p>
          </div>

          {/* Technologies */}
          {item.technologies && item.technologies.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Where I Applied */}
          {item.contexts && item.contexts.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                Where I Applied
              </h4>
              <div className="space-y-2">
                {/* Remove duplicates by entity_label */}
                {Array.from(new Map(item.contexts.map(ctx => [ctx.entity_label, ctx])).values()).map((ctx) => (
                  <div key={ctx.id} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-800">
                      <span className="font-semibold">{ctx.entity_label}</span>
                      <span className="text-gray-500 text-xs ml-1.5">({ctx.entity_type})</span>
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
      <div className="bg-white border border-gray-200 mb-6">
        <div className="border-b-4 border-red-600 px-4 py-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
            Top Stories
          </h3>
        </div>
        <div className="p-4">
          <ol className="space-y-4">
            {items.slice(0, 5).map((item, i) => (
              <li key={item.id} className="flex gap-3 items-start group">
                <span className="text-xl font-bold text-red-600 leading-none w-6 shrink-0">
                  {i + 1}
                </span>
                <button
                  onClick={() => onSelect(item.id)}
                  className="text-sm font-semibold text-gray-900 hover:text-red-600 cursor-pointer text-left leading-snug transition-colors"
                >
                  {item.business_impact}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 border border-gray-200 p-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
          About This Section
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
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
      className="flex-1 h-full bg-white overflow-y-auto applied-knowledge-scrollbar"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">

        {/* ── Masthead ── */}
        <header className="mb-6 sm:mb-8 border-b-4 border-red-600 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2">
                Applied Knowledge
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wider">
                Engineering Insights & Technical Dispatches
              </p>
            </div>

            {/* Search */}
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search articles..."
              className="border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-600 w-full sm:w-80 bg-white"
            />
          </div>
        </header>

        {/* ── 2-Column Layout ── */}
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left: Timeline Feed (70%) */}
          <main className="w-full lg:w-[68%]">
            {visible.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base text-gray-500 italic">
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
              className="h-16 flex items-center justify-center"
            >
              {loading && (
                <p className="font-sans text-xs uppercase tracking-widest text-gray-400 animate-pulse">
                  Loading more articles…
                </p>
              )}
              {!hasMore && filtered.length > 0 && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-px w-32 bg-gray-300" />
                  <p className="font-sans text-xs uppercase tracking-widest text-gray-500">
                    End of Timeline
                  </p>
                  <div className="h-px w-32 bg-gray-300" />
                </div>
              )}
            </div>
          </main>

          {/* Right: Sidebar (30%) */}
          <div className="hidden lg:block lg:w-[32%]">
            <Sidebar items={trending} onSelect={scrollToArticle} />
          </div>
        </div>

        {/* Mobile: Sidebar below feed */}
        <div className="lg:hidden mt-12 border-t-2 border-gray-200 pt-8">
          <Sidebar items={trending} onSelect={scrollToArticle} />
        </div>

      </div>
    </div>
  );
}
