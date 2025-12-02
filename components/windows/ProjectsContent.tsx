import { Folder, ExternalLink, Github } from 'lucide-react';
import { useState } from 'react';

export default function ProjectsContent() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const projects = [
    {
      id: 'ecommerce',
      name: 'E-Commerce Platform',
      description: 'A full-featured e-commerce platform built with Next.js, TypeScript, and Stripe integration.',
      tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe', 'PostgreSQL'],
      github: 'https://github.com/johndoe/ecommerce',
      demo: 'https://ecommerce-demo.com',
      icon: Folder,
    },
    {
      id: 'taskmanager',
      name: 'Task Manager Pro',
      description: 'Real-time collaborative task management application with drag-and-drop functionality.',
      tech: ['React', 'Firebase', 'Material-UI', 'React DnD'],
      github: 'https://github.com/johndoe/taskmanager',
      demo: 'https://taskmanager-demo.com',
      icon: Folder,
    },
    {
      id: 'weather',
      name: 'Weather Dashboard',
      description: 'Beautiful weather dashboard with 7-day forecasts, maps, and weather alerts.',
      tech: ['React', 'OpenWeather API', 'Recharts', 'Leaflet'],
      github: 'https://github.com/johndoe/weather',
      demo: 'https://weather-demo.com',
      icon: Folder,
    },
    {
      id: 'portfolio',
      name: 'Portfolio Builder',
      description: 'No-code portfolio builder with drag-and-drop interface and custom themes.',
      tech: ['Next.js', 'MongoDB', 'AWS S3', 'TailwindCSS'],
      github: 'https://github.com/johndoe/portfolio',
      demo: 'https://portfolio-demo.com',
      icon: Folder,
    },
  ];

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProject(null);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
        <div className="text-white space-y-1">
          <div className="px-3 py-2 ubuntu-selection-bg rounded">Projects</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Recent</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Favorites</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Archived</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-gray-700 px-4 py-2 text-white text-sm border-b border-gray-600 flex items-center gap-2">
          {currentView === 'detail' && (
            <>
              <button onClick={handleBack} className="hover:ubuntu-orange">
                ← Back
              </button>
              <span>/</span>
            </>
          )}
          <span>Projects</span>
          {currentView === 'detail' && (
            <>
              <span>/</span>
              <span>{selectedProject?.name}</span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {currentView === 'list' ? (
            <div className="grid grid-cols-3 gap-6">
              {projects.map((project) => {
                const Icon = project.icon;
                return (
                  <button
                    key={project.id}
                    onDoubleClick={() => handleProjectClick(project)}
                    className="flex flex-col items-center gap-2 p-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-20 h-20 text-orange-500" />
                    <span className="text-white text-center">{project.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-white max-w-3xl">
              <h1 className="mb-4">{selectedProject?.name}</h1>
              
              <p className="text-gray-300 mb-6">{selectedProject?.description}</p>

              <div className="mb-6">
                <h3 className="ubuntu-orange mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject?.tech.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href={selectedProject?.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 ubuntu-orange-bg rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Github className="w-5 h-5" />
                  <span>View on GitHub</span>
                </a>
                <a
                  href={selectedProject?.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Live Demo</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
