"use client";

import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { getEducation } from '@/lib/actions';

interface EducationData {
    id: number;
    institution_name: string;
    degree: string;
    start_year: number | null;
    end_year: number | null;
    description: string | null;
    field_of_study: string | null;
    grade: string | null;
}

export default function EducationContent() {
    const [education, setEducation] = useState<EducationData[]>([]);

    useEffect(() => {
        getEducation().then(e => setEducation(e as unknown as EducationData[]));
    }, []);

    if (education.length === 0) {
        return <div className="p-8 text-white">Loading education...</div>;
    }

    return (
        <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E]">
            <h1 className="text-2xl font-bold mb-8">Education</h1>
            <div className="space-y-6">
                {education.map((edu) => (
                    <div key={edu.id} className="bg-[#2C2C2C] rounded-lg p-6 border border-[#3E3E3E]">
                        <div className="flex items-center gap-3 mb-2">
                            <GraduationCap className="w-5 h-5 text-orange-400" />
                            <h3 className="font-bold text-lg">{edu.institution_name}</h3>
                        </div>
                        <p className="text-orange-400 mb-2">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''} {edu.grade ? `(${edu.grade})` : ''}</p>
                        <p className="text-sm text-gray-400 mb-2">
                            {edu.start_year || 'N/A'} - {edu.end_year || 'Present'}
                        </p>
                        {edu.description && (
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{edu.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
