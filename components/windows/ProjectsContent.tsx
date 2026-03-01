"use client";

import { Folder, ExternalLink, Github } from 'lucide-react';

export default function ProjectsContent() {
  // For now, static projects - can be made dynamic with database later
  const projects = [
    {
      id: 1,
      title: "EventMate AI",
      description: "A comprehensive event orchestration platform connecting Organisers, Attendees, and Admins through a secure, scalable booking system.",
      technologies: ["Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker"],
      demoUrl: null,
      repoUrl: "https://github.com/bhargava562",
      featured: true,
    },
    {
      id: 2,
      title: "Portfolio Website",
      description: "Ubuntu 24.04 themed portfolio website built with Next.js, featuring a desktop-like interface with draggable windows.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
      demoUrl: "/",
      repoUrl: "https://github.com/bhargava562",
      featured: true,
    },
  ];

  return (
    <div className="flex-1 h-full min-h-full p-8 overflow-y-auto text-white bg-[#1E1E1E]">
      <h1 className="text-2xl font-bold mb-8">My Projects</h1>
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#2C2C2C] rounded-lg p-6 border border-[#3E3E3E] hover:border-orange-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6 text-orange-400" />
                <h3 className="font-bold text-lg">{project.title}</h3>
                {project.featured && (
                  <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">Featured</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                )}
              </div>
            </div>

            <p className="text-gray-300 mb-4">{project.description}</p>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
