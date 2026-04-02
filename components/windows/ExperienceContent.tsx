"use client";

import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { getExperiences } from '@/lib/actions';

interface ExperienceData {
    id: number;
    company_name: string;
    role: string;
    start_date: Date | string | null;
    is_current: boolean;
    description: string | null;
    location: string | null;
    employment_type: string | null;
}

export default function ExperienceContent() {
    const [experiences, setExperiences] = useState<ExperienceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getExperiences()
            .then(e => {
                setExperiences(e as unknown as ExperienceData[]);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load experiences:', err);
                setError('Failed to load experience data.');
                setLoading(false);
            });
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Present';
        try {
            return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <div className="p-8 text-white bg-[#1E1E1E] h-full flex items-center justify-center">Loading experience...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-400 bg-[#1E1E1E] h-full flex items-center justify-center">{error}</div>;
    }

    if (experiences.length === 0) {
        return <div className="p-8 text-gray-400 bg-[#1E1E1E] h-full flex items-center justify-center">No experience found.</div>;
    }

    return (
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto text-white bg-[#1E1E1E]">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Work Experience</h1>
            <div className="space-y-4 sm:space-y-6">
                {experiences.map((exp, index) => (
                    <div key={exp.id} className={`border-l-2 ${index === 0 ? 'border-orange-500' : 'border-gray-600'} pl-6 relative`}>
                        <div className={`absolute -left-2 top-0 w-4 h-4 ${index === 0 ? 'bg-orange-500' : 'bg-gray-600'} rounded-full`} />
                        <div className="flex items-center gap-3 mb-1">
                            <Briefcase className="w-4 h-4 text-orange-400" />
                            <span className="font-semibold">{exp.role}</span>
                            {exp.employment_type && <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">{exp.employment_type}</span>}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                            {exp.company_name} • {formatDate(exp.start_date ? new Date(exp.start_date) : null)} - {exp.is_current ? 'Present' : ''}
                        </div>

                        {exp.description && (
                            <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{exp.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
