"use client";

import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { getExperiences } from '@/lib/actions';

interface ExperienceData {
    id: number;
    company: string;
    role: string;
    startDate: Date;
    endDate: Date | null;
    description: string | null;
    projectOverview: string | null;
    keyContributions: string[] | null;
    techStack: string | null;
    type: string;
}

export default function ExperienceContent() {
    const [experiences, setExperiences] = useState<ExperienceData[]>([]);

    useEffect(() => {
        getExperiences().then(setExperiences);
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Present';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (experiences.length === 0) {
        return <div className="p-8 text-white">Loading experience...</div>;
    }

    return (
        <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E]">
            <h1 className="text-2xl font-bold mb-8">Work Experience</h1>
            <div className="space-y-6">
                {experiences.map((exp, index) => (
                    <div key={exp.id} className={`border-l-2 ${index === 0 ? 'border-orange-500' : 'border-gray-600'} pl-6 relative`}>
                        <div className={`absolute -left-2 top-0 w-4 h-4 ${index === 0 ? 'bg-orange-500' : 'bg-gray-600'} rounded-full`} />
                        <div className="flex items-center gap-3 mb-1">
                            <Briefcase className="w-4 h-4 text-orange-400" />
                            <span className="font-semibold">{exp.role}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">{exp.type}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                            {exp.company} • {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                        </div>

                        {exp.projectOverview && (
                            <p className="text-sm text-gray-300 mb-3 italic">{exp.projectOverview}</p>
                        )}

                        {exp.keyContributions && exp.keyContributions.length > 0 && (
                            <ul className="text-sm text-gray-300 space-y-1.5 mb-3">
                                {exp.keyContributions.map((contribution: string, i: number) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="text-orange-400 mt-1">•</span>
                                        <span>{contribution}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {exp.description && !exp.keyContributions?.length && (
                            <p className="text-sm text-gray-300 mb-3">{exp.description}</p>
                        )}

                        {exp.techStack && (
                            <div className="text-xs text-gray-400 bg-gray-800 px-3 py-2 rounded inline-block">
                                <span className="text-orange-400">Tech:</span> {exp.techStack}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
