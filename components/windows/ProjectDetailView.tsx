"use client";

import Image from "next/image";
import { useState } from "react";
import { Github, ExternalLink, Lightbulb, Wrench, Users } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectNode {
  id: string | number;
  title: string;
  tagline: string | null;
  description: string;
  business_problem: string | null;
  engineering_solution: string | null;
  tech_stack: string[] | null;
  github_url: string | null;
  demo_url: string | null;
  demo_video_url: string | null;
  image_url: string | null;
  screenshots: string[] | null;
  role: string | null;
  project_type: string | null;
  team_name: string | null;
  is_featured: boolean;
  collaborators: { id: string; name: string; linkedin_url?: string }[] | null;
  [key: string]: unknown;
}

interface Props {
  project: ProjectNode;
}

// ─── Universal Embed URL Parser ───────────────────────────────────────────────

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

// ─── Screenshot thumbnail ─────────────────────────────────────────────────────

function Screenshot({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <div className="relative h-24 w-40 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/30">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImgSrc("/linux-placeholder.webp")}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// No backdrop, no fixed positioning — this fills the absolute overlay slot
// provided by ProjectsContent.

export default function ProjectDetailView({ project }: Props) {
  const techList = Array.isArray(project.tech_stack) ? project.tech_stack.filter(Boolean) : [];
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots.filter(Boolean) : [];
  const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];

  const media = project.demo_video_url ? getEmbedUrl(project.demo_video_url) : null;

  const hasGithub = !!(project.github_url && project.github_url.trim());
  const hasDemo = !!(project.demo_url && project.demo_url.trim());

  return (
    // Full-size opaque panel — scrolls internally, no bleed-through
    <div className="w-full h-full bg-[#121212] overflow-y-auto projects-scrollbar">

      {/* ── Media ── */}
      {media && (
        <div className="w-full bg-black">
          {media.type === "video" ? (
            <video
              src={media.src}
              controls
              className="w-full aspect-video"
            />
          ) : (
            <iframe
              src={media.src}
              className="w-full aspect-video border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${project.title} demo`}
            />
          )}
        </div>
      )}

      {/* ── Screenshots strip ── */}
      {screenshots.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 py-4 border-b border-white/5">
          {screenshots.map((s, i) => (
            <Screenshot key={i} src={s} alt={`${project.title} screenshot ${i + 1}`} />
          ))}
        </div>
      )}

      {/* ── Content body ── */}
      <div className="px-6 py-6 space-y-6">

        {/* Title row + action buttons */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {project.is_featured && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Featured
                </span>
              )}
              {project.project_type && (
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  {project.project_type}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">{project.title}</h2>
            {project.tagline && (
              <p className="mt-1 text-sm text-indigo-300/80 italic">{project.tagline}</p>
            )}
            {(project.role || project.team_name) && (
              <p className="mt-2 text-xs text-gray-500">
                {project.role && <span className="text-[#E95420] font-semibold">{project.role}</span>}
                {project.role && project.team_name && <span className="mx-1.5 text-gray-600">·</span>}
                {project.team_name && <span>{project.team_name}</span>}
              </p>
            )}
          </div>

          {/* Action buttons */}
          {(hasGithub || hasDemo) && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {hasDemo && (
                <a
                  href={project.demo_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              {hasGithub && (
                <a
                  href={project.github_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-white/5 text-gray-300 hover:text-white text-sm font-semibold border border-white/15 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed">{project.description}</p>

        {/* Business Problem */}
        {project.business_problem && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex gap-3">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">Problem</p>
              <p className="text-sm text-gray-300 leading-relaxed">{project.business_problem}</p>
            </div>
          </div>
        )}

        {/* Engineering Solution */}
        {project.engineering_solution && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Engineering Solution</p>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{project.engineering_solution}</p>
          </div>
        )}

        {/* Tech Stack */}
        {techList.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {techList.map(tech => (
                <span
                  key={tech}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators */}
        {collaborators.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Team</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {collaborators.map(c =>
                c.linkedin_url ? (
                  <a
                    key={c.id}
                    href={c.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    {c.name}
                  </a>
                ) : (
                  <span key={c.id} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    {c.name}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Bottom padding so last card doesn't hug the edge */}
        <div className="h-4" />
      </div>
    </div>
  );
}
