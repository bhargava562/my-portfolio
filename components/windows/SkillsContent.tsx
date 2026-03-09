"use client";

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { getSkillsByCategory, getUiConfigData } from '@/lib/actions';

export default function SkillsContent() {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, { id: number; name: string; category: string; icon: string | null; level: number; }[]>>({});
  const [uiConfig, setUiConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    getSkillsByCategory().then(setSkillsByCategory);
    getUiConfigData().then(setUiConfig);
  }, []);

  if (Object.keys(skillsByCategory).length === 0) {
    return <div className="p-8 text-white bg-[#1E1E1E]">Loading skills...</div>;
  }

  // Safely extract the presentation config mapping
  const skillsConfig = (uiConfig?.skills as Record<string, unknown>) || {};
  const categoryIconsMap = (skillsConfig.categoryIcons as Record<string, string>) || {};
  const defaultIconStr = (skillsConfig.defaultIcon as string) || 'Code2';

  return (
    <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E]">
      <h1 className="text-2xl font-bold mb-8">Technical Skills & Expertise</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(skillsByCategory).map(([category, skills]) => {
          // Dynamic icon resolution
          const iconName = categoryIconsMap[category] || defaultIconStr;
          // @ts-expect-error - Dynamic lucide indexing
          const Icon = LucideIcons[iconName] || LucideIcons.Code2;
          
          return (
            <div key={category} className="bg-[#2C2C2C] rounded-lg p-6 border border-[#3E3E3E]">
              <div className="flex items-center gap-3 mb-4 border-b border-[#3E3E3E] pb-3">
                <Icon className="w-5 h-5 text-[#E95420]" />
                <h3 className="font-bold">{category}</h3>
              </div>
              <div className="space-y-4">
                {skills.map((skill) => {
                  const level = skill.level || 50;
                  const levelText = level <= 40 ? 'Beginner' : level < 80 ? 'Intermediate' : 'Expert';
                  const levelColor = level <= 40 ? 'text-yellow-400' : level < 80 ? 'text-blue-400' : 'text-green-400';
                  const barColor = level <= 40 ? 'from-yellow-500 to-yellow-600' : level < 80 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600';

                  return (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${levelColor}`}>{levelText}</span>
                          <span className="text-xs text-gray-400">{level}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${level}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
