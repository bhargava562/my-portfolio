"use client";

import { useEffect, useState } from 'react';
import { Award, Calendar, Star } from 'lucide-react';
import { getAwards } from '@/lib/actions';

interface AwardData {
    id: string;
    title: string;
    issuer: string | null;
    award_date: Date | null;
    description: string | null;
}

export default function AwardsContent() {
    const [awards, setAwards] = useState<AwardData[]>([]);

    useEffect(() => {
        getAwards().then(setAwards);
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (awards.length === 0) {
        return <div className="p-8 text-white h-full bg-[#1E1E1E]">No awards found or loading...</div>;
    }

    return (
        <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E] h-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold">Awards & Honors</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {awards.map((award) => (
                    <div key={award.id} className="relative overflow-hidden bg-gradient-to-br from-[#2C2C2C] to-[#222] rounded-xl p-6 border border-[#3E3E3E] group hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Star className="w-24 h-24 text-yellow-500" />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg text-gray-100 mb-2 leading-tight">{award.title}</h3>
                            {award.issuer && (
                                <p className="text-yellow-500 font-medium text-sm mb-3 object-contain">{award.issuer}</p>
                            )}
                            
                            {award.award_date && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 bg-black/30 w-fit px-2.5 py-1 rounded-full border border-[#444]">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(award.award_date)}</span>
                                </div>
                            )}

                            {award.description && (
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {award.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
