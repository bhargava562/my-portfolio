"use client";

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { getSkillsByCategory, getUiConfigData } from '@/lib/actions';

export default function SkillsContent() {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, { id: number; name: string; category: string; icon: string | null; level: number; }[]>>({});
  const [uiConfig, setUiConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSkillsByCategory().catch(err => {
        console.error('Failed to load skills:', err);
        return {};
      }),
      getUiConfigData().catch(err => {
        console.error('Failed to load UI config:', err);
        return {};
      })
    ])
      .then(([skills, config]) => {
        setSkillsByCategory(skills);
        setUiConfig(config);
      })
      .catch(err => {
        console.error('Critical error loading skills:', err);
        setError('Failed to load skills. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-white bg-[#1E1E1E] h-full flex items-center justify-center">Loading skills...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400 bg-[#1E1E1E] h-full flex items-center justify-center">{error}</div>;
  }

  if (Object.keys(skillsByCategory).length === 0) {
    return <div className="p-8 text-gray-400 bg-[#1E1E1E] h-full flex items-center justify-center">No skills found.</div>;
  }

  // Safely extract the presentation config mapping
  const skillsConfig = (uiConfig?.skills as Record<string, unknown>) || {};
  const categoryIconsMap = (skillsConfig.categoryIcons as Record<string, string>) || {};
  const defaultIconStr = (skillsConfig.defaultIcon as string) || 'Code2';

  return (
    // Container query context: this div's width determines breakpoints for children
    <div className="flex-1 h-full bg-[#1E1E1E] overflow-auto text-white @container">
      <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Technical Skills & Expertise</h1>
        {/* Container query responsive grid: 1 col (default) → 2 cols (@md) → 3 cols (@lg) */}
        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4 w-full">
        {Object.entries(skillsByCategory).map(([category, skills]) => {
          const iconName = categoryIconsMap[category] || defaultIconStr;
          // @ts-expect-error - Dynamic lucide indexing
          const Icon = LucideIcons[iconName] || LucideIcons.Code2;

          return (
            <div key={category} className="w-full bg-[#2C2C2C] rounded-lg p-5 border border-[#3E3E3E] flex flex-col overflow-hidden min-w-0">
              {/* Category Header — min-w-0 prevents text overflow */}
              <div className="flex items-center gap-3 mb-4 border-b border-[#3E3E3E] pb-3 flex-shrink-0 min-w-0">
                <Icon className="w-5 h-5 text-[#E95420] flex-shrink-0" />
                <h3 className="font-bold text-sm truncate text-ellipsis">{category}</h3>
              </div>

              {/* Skills List */}
              <div className="space-y-3">
                {skills.map((skill) => {
                  const level = (skill as unknown as Record<string, unknown>).proficiency as number ?? skill.level ?? 50;
                  const levelText = level <= 40 ? 'Beginner' : level < 80 ? 'Intermediate' : 'Expert';
                  const levelColor = level <= 40 ? 'text-yellow-400' : level < 80 ? 'text-blue-400' : 'text-green-400';
                  const barColor = level <= 40 ? 'from-yellow-500 to-yellow-600' : level < 80 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600';

                  return (
                    <div key={skill.id} className="space-y-1 w-full min-w-0">
                      {/* Skill Name + Level Info — min-w-0 forces flex to respect parent width */}
                      <div className="flex justify-between items-center gap-2 w-full min-w-0">
                        <span className="text-sm font-medium truncate text-ellipsis">{skill.name}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
                          <span className={`text-xs font-medium ${levelColor}`}>{levelText}</span>
                          <span className="text-xs text-gray-400">{level}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
    </div>
  );
}
