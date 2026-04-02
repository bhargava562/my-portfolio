"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Star, ChevronLeft, FolderOpen } from "lucide-react";
import { getProjects } from "@/lib/actions";
import ProjectDetailView, { type ProjectNode } from "./ProjectDetailView";

// ─── Skill pill color palette (cycles by index) ───────────────────────────────

const PILL_COLORS = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
];

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onOpen }: { project: ProjectNode; onOpen: () => void }) {
  const techList = Array.isArray(project.tech_stack) ? project.tech_stack.filter(Boolean) : [];
  const pills = techList.slice(0, 3);

  return (
    <div className="group relative flex flex-col h-full rounded-xl border border-gray-700/50 bg-[#1e1e1e]/80 backdrop-blur-md hover:bg-[#252525]/90 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Gradient accent top bar — fades in on hover */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-100 leading-snug truncate">{project.title}</h3>
            {project.tagline && (
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-1 italic">{project.tagline}</p>
            )}
          </div>
          {project.is_featured && (
            <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5 fill-amber-400" />
          )}
        </div>

        {/* Type / Role badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.project_type && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.project_type}
            </span>
          )}
          {project.role && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E95420]/10 text-[#E95420] border border-[#E95420]/20">
              {project.role}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1">
          {project.description}
        </p>

        {/* Skill pills */}
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pills.map((tech, i) => (
              <span
                key={tech}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${PILL_COLORS[i % PILL_COLORS.length]}`}
              >
                {tech}
              </span>
            ))}
            {techList.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-500">
                +{techList.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onOpen}
          className="mt-auto flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 group/btn transition-colors duration-200 w-fit"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectsContent() {
  const [projects, setProjects] = useState<ProjectNode[]>([]);
  const [selected, setSelected] = useState<ProjectNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(p => {
        setProjects(p as unknown as ProjectNode[]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 h-full bg-[#1e1e1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading projects…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full bg-[#1e1e1e] flex items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex-1 h-full bg-[#1e1e1e] flex items-center justify-center">
        <p className="text-sm text-gray-500">No projects found.</p>
      </div>
    );
  }

  return (
    // ── Outer shell: relative + overflow-hidden so the absolute overlay is clipped inside the window ──
    <div className="relative flex-1 h-full bg-[#1e1e1e] text-white flex flex-col overflow-hidden">

      {/* ── Sticky breadcrumb header (mirrors CertificationsContent pattern) ── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#3E3E3E] flex-shrink-0">
        {selected ? (
          <>
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-gray-600">/</span>
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm truncate">{selected.title}</span>
          </>
        ) : (
          <>
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Projects</span>
            <span className="text-xs text-gray-500 ml-1">({projects.length} items)</span>
          </>
        )}
      </div>

      {/* ── Grid view ── */}
      <div className="flex-1 overflow-y-auto projects-scrollbar p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      {/* ── Detail overlay: absolute inset-0 so it covers the window content area only ── */}
      {selected && (
        <div className="absolute inset-0 z-10 bg-[#121212]">
          <ProjectDetailView project={selected} />
        </div>
      )}
    </div>
  );
}
