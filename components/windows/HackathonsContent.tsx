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

    useEffect(() => {
        getHackathons().then(h => setHackathons(h as unknown as HackathonData[]));
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'TBA';
        return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (hackathons.length === 0) {
        return <div className="p-8 text-white h-full bg-[#1E1E1E]">Loading hackathons...</div>;
    }

    return (
        <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E] h-full">
            <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-8 h-8 text-orange-500" />
                <h1 className="text-2xl font-bold">Hackathons</h1>
            </div>
            
            <div className="space-y-6">
                {hackathons.map((hack) => (
                    <div key={hack.id} className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3E3E3E] hover:border-orange-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-xl text-gray-100 group-hover:text-orange-400 transition-colors">{hack.name}</h3>
                                {hack.organizer && <p className="text-orange-500 font-medium mt-1">{hack.organizer}</p>}
                            </div>
                            {hack.position && (
                                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-xs font-bold rounded-full shadow-lg">
                                    {hack.position}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(hack.event_start_date)}</span>
                            </div>
                            {hack.category && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                    <span>{hack.category}</span>
                                </div>
                            )}
                        </div>

                        {hack.description && (
                            <p className="text-gray-300 leading-relaxed text-sm bg-[#1A1A1A] p-4 rounded-lg border border-[#333]">
                                {hack.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
