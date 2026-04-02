"use client";

import { useEffect, useState } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { getHackathons } from '@/lib/actions';

interface HackathonData {
    id: string;
    name: string;
    organizer: string | null;
    event_start_date: Date | null;
    description: string | null;
    category: string | null;
    position: string | null;
}

export default function HackathonsContent() {
    const [hackathons, setHackathons] = useState<HackathonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getHackathons()
            .then(h => {
                setHackathons(h as unknown as HackathonData[]);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load hackathons:', err);
                setError('Failed to load hackathons.');
                setLoading(false);
            });
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'TBA';
        try {
            return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <div className="p-8 text-white h-full bg-[#1E1E1E] flex items-center justify-center">Loading hackathons...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-400 h-full bg-[#1E1E1E] flex items-center justify-center">{error}</div>;
    }

    if (hackathons.length === 0) {
        return <div className="p-8 text-gray-400 h-full bg-[#1E1E1E] flex items-center justify-center">No hackathons found.</div>;
    }

    return (
        <div className="flex-1 p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 overflow-auto text-white bg-[#1E1E1E] h-full @container">
            <div className="flex items-center gap-2 @sm:gap-2.5 @md:gap-3 mb-4 @sm:mb-6 @md:mb-8">
                <Trophy className="w-5 h-5 @sm:w-6 @sm:h-6 @md:w-8 @md:h-8 @lg:w-9 @lg:h-9 text-orange-500" />
                <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-bold">Hackathons</h1>
            </div>

            <div className="space-y-3 @sm:space-y-4 @md:space-y-5 @lg:space-y-6">
                {hackathons.map((hack) => (
                    <div key={hack.id} className="bg-[#2C2C2C] rounded-xl p-3 @sm:p-4 @md:p-5 @lg:p-6 border border-[#3E3E3E] hover:border-orange-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-2 @sm:mb-2.5 @md:mb-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm @sm:text-base @md:text-lg @lg:text-xl text-gray-100 group-hover:text-orange-400 transition-colors truncate">{hack.name}</h3>
                                {hack.organizer && <p className="text-orange-500 font-medium mt-0.5 @sm:mt-1 text-xs @sm:text-sm @md:text-base truncate">{hack.organizer}</p>}
                            </div>
                            {hack.position && (
                                <span className="px-2 @sm:px-2.5 @md:px-3 py-0.5 @sm:py-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-[9px] @sm:text-[10px] @md:text-xs font-bold rounded-full shadow-lg flex-shrink-0 ml-2 whitespace-nowrap">
                                    {hack.position}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 @sm:gap-3 @md:gap-4 text-[10px] @sm:text-xs @md:text-sm text-gray-400 mb-2 @sm:mb-3 @md:mb-4 flex-wrap">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                <span className="truncate">{formatDate(hack.event_start_date)}</span>
                            </div>
                            {hack.category && (
                                <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 @sm:w-1.5 @sm:h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                                    <span className="truncate">{hack.category}</span>
                                </div>
                            )}
                        </div>

                        {hack.description && (
                            <p className="text-gray-300 leading-relaxed text-xs @sm:text-sm @md:text-base bg-[#1A1A1A] p-2 @sm:p-3 @md:p-4 rounded-lg border border-[#333]">
                                {hack.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
