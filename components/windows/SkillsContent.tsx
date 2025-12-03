import { Code2, Database, Layout, Server, Wrench, Users } from 'lucide-react';

export default function SkillsContent() {
  const skillCategories = [
    {
      title: 'Frontend Development',
      icon: Layout,
      skills: [
        { name: 'React / Next.js', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'Tailwind CSS', level: 95 },
        { name: 'HTML5 / CSS3', level: 98 },
        { name: 'Motion / Framer', level: 85 },
      ],
    },
    {
      title: 'Backend Development',
      icon: Server,
      skills: [
        { name: 'Node.js', level: 88 },
        { name: 'Python', level: 82 },
        { name: 'REST APIs', level: 92 },
        { name: 'GraphQL', level: 78 },
      ],
    },
    {
      title: 'Database & Storage',
      icon: Database,
      skills: [
        { name: 'PostgreSQL', level: 85 },
        { name: 'MongoDB', level: 80 },
        { name: 'Redis', level: 75 },
        { name: 'Firebase', level: 88 },
      ],
    },
    {
      title: 'Tools & Workflow',
      icon: Wrench,
      skills: [
        { name: 'Git / GitHub', level: 95 },
        { name: 'Docker', level: 80 },
        { name: 'AWS', level: 75 },
        { name: 'CI/CD', level: 82 },
      ],
    },
    {
      title: 'UI/UX Design',
      icon: Code2,
      skills: [
        { name: 'Figma', level: 90 },
        { name: 'Adobe XD', level: 85 },
        { name: 'User Research', level: 80 },
        { name: 'Prototyping', level: 88 },
      ],
    },
    {
      title: 'Soft Skills',
      icon: Users,
      skills: [
        { name: 'Team Leadership', level: 85 },
        { name: 'Communication', level: 92 },
        { name: 'Problem Solving', level: 95 },
        { name: 'Agile/Scrum', level: 88 },
      ],
    },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
        <div className="text-white space-y-1">
          <div className="px-3 py-2 ubuntu-selection-bg rounded">Skills</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Experience</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Education</div>
          <div className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer">Certifications</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-gray-700 px-4 py-2 text-white text-sm border-b border-gray-600">
          Skills & Experience
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto text-white">
          <h1 className="mb-8">Technical Skills & Expertise</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skillCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.title} className="bg-[#2C2C2C] rounded-lg p-6 border border-[#3E3E3E]">
                  <div className="flex items-center gap-3 mb-6 border-b border-[#3E3E3E] pb-3">
                    <Icon className="w-6 h-6 text-[#E95420]" />
                    <h3 className="font-bold text-lg">{category.title}</h3>
                  </div>
                  <div className="space-y-5">
                    {category.skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between mb-2 items-center">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-xs text-[#AEA79F]">{skill.level}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden border border-[#3E3E3E]">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Experience Timeline */}
          <div className="mt-12">
            <h2 className="mb-6">Work Experience</h2>
            <div className="space-y-6">
              <div className="border-l-2 border-orange-500 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full" />
                <div className="mb-1">Senior Frontend Developer</div>
                <div className="text-sm text-gray-400 mb-2">Tech Corp • 2021 - Present</div>
                <p className="text-sm text-gray-300">
                  Leading development of enterprise web applications, mentoring junior developers,
                  and implementing best practices for React and TypeScript projects.
                </p>
              </div>
              <div className="border-l-2 border-orange-500 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full" />
                <div className="mb-1">Full Stack Developer</div>
                <div className="text-sm text-gray-400 mb-2">StartupXYZ • 2019 - 2021</div>
                <p className="text-sm text-gray-300">
                  Built and maintained multiple web applications using React, Node.js, and MongoDB.
                  Collaborated with design team to create intuitive user interfaces.
                </p>
              </div>
              <div className="border-l-2 border-gray-600 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-600 rounded-full" />
                <div className="mb-1">Junior Developer</div>
                <div className="text-sm text-gray-400 mb-2">WebDev Agency • 2017 - 2019</div>
                <p className="text-sm text-gray-300">
                  Developed client websites and web applications using modern JavaScript frameworks.
                  Gained experience in full development lifecycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
