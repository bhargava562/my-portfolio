"use client";

import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { getEducation } from '@/lib/actions';

interface EducationData {
    id: number;
    institution: string;
    degree: string;
    startDate: Date | null;
    endDate: Date | null;
    description: string | null;
}

export default function EducationContent() {
    const [education, setEducation] = useState<EducationData[]>([]);

    useEffect(() => {
        getEducation().then(setEducation);
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Present';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

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
                            <h3 className="font-bold text-lg">{edu.institution}</h3>
                        </div>
                        <p className="text-orange-400 mb-2">{edu.degree}</p>
                        <p className="text-sm text-gray-400 mb-2">
                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </p>
                        {edu.description && (
                            <p className="text-sm text-gray-300">{edu.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
