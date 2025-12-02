import { Github, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';

export default function AboutContent() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
        <div className="text-white space-y-1">
          <div className="px-3 py-2 ubuntu-selection-bg rounded">About</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Contact</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Social</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-gray-700 px-4 py-2 text-white text-sm border-b border-gray-600">
          About Me
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto text-white">
          <div className="max-w-3xl">
            {/* Profile Section */}
            <div className="flex items-start gap-6 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-5xl">
                JD
              </div>
              <div className="flex-1">
                <h1 className="mb-2">John Doe</h1>
                <h3 className="ubuntu-orange mb-3">Full Stack Developer & UI/UX Designer</h3>
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <section className="mb-8">
              <h2 className="mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                Passionate software engineer with 5+ years of experience building modern web applications. 
                Specialized in React, TypeScript, and Node.js with a keen eye for design and user experience.
              </p>
              <p className="text-gray-300 leading-relaxed">
                I love creating intuitive interfaces and solving complex problems with elegant solutions. 
                When I'm not coding, you can find me exploring new technologies, contributing to open source, 
                or enjoying the outdoors.
              </p>
            </section>

            {/* Social Links */}
            <section>
              <h2 className="mb-3">Connect With Me</h2>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span>github.com/johndoe</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>linkedin.com/in/johndoe</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span>@johndoe</span>
                </a>
                <a
                  href="mailto:john@example.com"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>john@example.com</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
