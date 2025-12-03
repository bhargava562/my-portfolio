"use client";

import { useEffect, useState } from 'react';
import { Github, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';
import { getProfile } from '@/lib/actions';

export default function AboutContent() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) return <div className="p-8 text-white">Loading profile...</div>;

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
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-5xl overflow-hidden">
                {/* Use avatarUrl if available, else initials */}
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" /> : "JD"}
              </div>
              <div className="flex-1">
                <h1 className="mb-2">{profile.name}</h1>
                <h3 className="ubuntu-orange mb-3">{profile.title}</h3>
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Chennai, India</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <section className="mb-8">
              <h2 className="mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">
                {profile.bio}
              </p>
            </section>

            {/* Social Links */}
            <section>
              <h2 className="mb-3">Connect With Me</h2>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:ubuntu-orange-bg transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>{profile.email}</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
