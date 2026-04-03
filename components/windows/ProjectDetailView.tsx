"use client";

import Image from "next/image";
import { useState } from "react";
import { Github, ExternalLink, Lightbulb, Wrench, Users, Briefcase } from "lucide-react";

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
    <div className="relative h-20 w-32 flex-shrink-0 rounded-md overflow-hidden border border-white/10 bg-black/30">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="128px"
        className="object-cover"
        onError={() => setImgSrc("/linux-placeholder.webp")}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// 2-column layout: content on left, video sidebar on right

export default function ProjectDetailView({ project }: Props) {
  const techList = Array.isArray(project.tech_stack) ? project.tech_stack.filter(Boolean) : [];
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots.filter(Boolean) : [];
  const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];

  const media = project.demo_video_url ? getEmbedUrl(project.demo_video_url) : null;

  const hasGithub = !!(project.github_url && project.github_url.trim());
  const hasDemo = !!(project.demo_url && project.demo_url.trim());

  return (
    // Container query context: 2-column grid responsive to window width
    <div className="w-full h-full bg-[#121212] overflow-y-auto projects-scrollbar @container">
      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-6 @lg:gap-8 p-4 sm:p-6 md:p-8 max-w-7xl">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN (2/3) — All content sections
            ════════════════════════════════════════════════════════════════════ */}
        <div className="@lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">

          {/* Title + Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              {project.is_featured && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Featured
                </span>
              )}
              {project.project_type && (
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  {project.project_type}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-1 sm:mb-2">
              {project.title}
            </h1>

            {project.tagline && (
              <p className="text-sm sm:text-base md:text-lg text-indigo-300/80 italic mb-2 sm:mb-3">
                {project.tagline}
              </p>
            )}

            {(project.role || project.team_name) && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 pt-2 border-t border-white/10">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
                {project.role && (
                  <span>
                    <span className="text-[#E95420] font-semibold">{project.role}</span>
                  </span>
                )}
                {project.role && project.team_name && (
                  <span className="text-gray-600">·</span>
                )}
                {project.team_name && (
                  <span>{project.team_name}</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Business Problem */}
          {project.business_problem && (
            <div className="border-l-4 border-l-amber-500 bg-amber-500/5 rounded-r-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400">
                  The Problem
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {project.business_problem}
              </p>
            </div>
          )}

          {/* Engineering Solution */}
          {project.engineering_solution && (
            <div className="border-l-4 border-l-indigo-500 bg-indigo-500/5 rounded-r-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-400">
                  The Solution
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {project.engineering_solution}
              </p>
            </div>
          )}

          {/* Tech Stack */}
          {techList.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {techList.map(tech => (
                  <span
                    key={tech}
                    className="text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots strip */}
          {screenshots.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2">
                Screenshots
              </h3>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2">
                {screenshots.map((s, i) => (
                  <Screenshot key={i} src={s} alt={`${project.title} screenshot ${i + 1}`} />
                ))}
              </div>
            </div>
          )}

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2 flex-1">
                  Team
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {collaborators.map(c =>
                  c.linkedin_url ? (
                    <a
                      key={c.id}
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors"
                    >
                      {c.name}
                    </a>
                  ) : (
                    <span key={c.id} className="text-xs font-medium px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                      {c.name}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Padding */}
          <div className="h-4" />
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT COLUMN (1/3) — Video sidebar
            ════════════════════════════════════════════════════════════════════ */}
        <div className="@lg:col-span-1 space-y-4 sticky top-8 h-fit">

          {/* Demo Video */}
          {media && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Demo
              </h3>
              <div className="relative rounded-lg overflow-hidden bg-black border border-white/10 aspect-video">
                {media.type === "video" ? (
                  <video
                    src={media.src}
                    controls
                    className="w-full h-full"
                  />
                ) : (
                  <iframe
                    src={media.src}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${project.title} demo`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Action Buttons — full width stack */}
          {(hasGithub || hasDemo) && (
            <div className="space-y-2 pt-2">
              {hasDemo && (
                <a
                  href={project.demo_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_16px_rgba(99,102,241,0.4)]"
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
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-transparent hover:bg-white/5 text-gray-300 hover:text-white text-sm font-semibold border border-white/15 hover:border-white/30 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}