"use client";

import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/actions';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { resolveImagePath } from '@/lib/image-field';
import { IMAGE_SIZES } from '@/lib/image-sizes';

interface ProjectNode {
    id: number;
    title: string;
    description: string;
    tagline: string | null;
    tech_stack: string[] | null;
    collaborators: Record<string, unknown>[] | null;
    is_featured: boolean;
    role: string | null;
    project_type: string | null;
    team_name: string | null;
}

export default function ProjectsContent() {
  const [projects, setProjects] = useState<ProjectNode[]>([]);

  useEffect(() => {
      getProjects().then(p => setProjects(p as unknown as ProjectNode[]));
  }, []);

  if (projects.length === 0) {
      return <div className="p-8 text-white h-full bg-[#1E1E1E]">Loading projects...</div>;
  }

  return (
    <div className="flex-1 h-full min-h-full p-8 overflow-y-auto text-white bg-[#1E1E1E]">
      <h1 className="text-2xl font-bold mb-8">My Projects</h1>
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => {
          const techList: string[] = Array.isArray(project.tech_stack) ? project.tech_stack : [];

          return (
            <div
              key={project.id}
              className="bg-[#2C2C2C] rounded-lg p-6 border border-[#3E3E3E] hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-black/20">
                       <ImageWithFallback
                         imagePath={resolveImagePath("projects", project as unknown as Record<string, unknown>) || ""}
                         alt={project.title}
                         width={IMAGE_SIZES.project.width}
                         height={IMAGE_SIZES.project.height}
                         className="w-full h-full"
                      />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{project.title}</h3>
                    {project.tagline && <p className="text-sm text-gray-400 italic mb-1">{project.tagline}</p>}
                  </div>
                  {project.is_featured && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">Featured</span>
                  )}
                </div>
              </div>

              {project.role && (
                 <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-wide">Role: {project.role}</div>
              )}
              {project.project_type && (
                 <div className="text-xs text-blue-400 mb-2">{project.project_type} {project.team_name ? `- ${project.team_name}` : ''}</div>
              )}

              <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">{project.description}</p>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#3E3E3E]">
                <span className="text-xs text-gray-400 w-full mb-1">Tech Stack:</span>
                {techList.filter(Boolean).map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 bg-[#1E1E1E] border border-gray-600 text-gray-300 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
