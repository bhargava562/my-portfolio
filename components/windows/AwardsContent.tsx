"use client";

import { useEffect, useState } from 'react';
import { Award, Calendar, Star } from 'lucide-react';
import { getAwards } from '@/lib/actions';

interface AwardData {
    id: string;
    title: string;
    issuer?: string | null;
    organization?: string | null;
    award_date: Date | string | null;
    description: string | null;
    category?: string | null;
    certificate_file_path?: string | null;
    display_order?: number;
}

export default function AwardsContent() {
    const [awards, setAwards] = useState<AwardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAwards()
            .then(a => {
                setAwards(a as unknown as AwardData[]);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load awards:', err);
                setError('Failed to load awards.');
                setLoading(false);
            });
    }, []);

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    };

    const getAwarder = (award: AwardData) => {
        return award.organization || award.issuer || null;
    };

    if (loading) {
        return <div className="p-8 text-white h-full bg-[#1E1E1E] flex items-center justify-center">Loading awards...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-400 h-full bg-[#1E1E1E] flex items-center justify-center">{error}</div>;
    }

    if (awards.length === 0) {
        return <div className="p-8 text-gray-400 h-full bg-[#1E1E1E] flex items-center justify-center">No awards found.</div>;
    }

    return (
        // Container query context
        <div className="flex-1 p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 overflow-auto text-white bg-[#1E1E1E] h-full @container">
            <div className="flex items-center gap-2 @sm:gap-2.5 @md:gap-3 mb-4 @sm:mb-6 @md:mb-8">
                <div className="w-8 h-8 @sm:w-10 @sm:h-10 @md:w-12 @md:h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 @sm:w-5 @sm:h-5 @md:w-6 @md:h-6 text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-bold text-white">
                        Awards & Honors
                    </h1>
                    <p className="text-[9px] @sm:text-[10px] @md:text-xs text-yellow-400">
                        {awards.length} {awards.length === 1 ? 'award' : 'awards'}
                    </p>
                </div>
            </div>

            {/* Container query responsive grid: 1 col → 2 cols (@3xl) → 3 cols (@4xl) */}
            <div className="grid grid-cols-1 @3xl:grid-cols-2 @4xl:grid-cols-3 gap-3 @sm:gap-4 @md:gap-5 @lg:gap-6">
                {awards.map((award) => (
                    <div key={award.id} className="relative overflow-hidden bg-gradient-to-br from-[#2C2C2C] to-[#222] rounded-lg p-3 @sm:p-4 @md:p-5 @lg:p-6 border border-[#3E3E3E] group hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                        <div className="absolute top-0 right-0 p-2 @sm:p-3 @md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Star className="w-16 h-16 @sm:w-20 @sm:h-20 @md:w-24 @md:h-24 text-yellow-500" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-sm @sm:text-base @md:text-lg @lg:text-xl text-gray-100 mb-1 @sm:mb-2 @md:mb-3 leading-tight pr-4">
                                {award.title}
                            </h3>
                            {getAwarder(award) && (
                                <p className="text-yellow-500 font-medium text-[10px] @sm:text-xs @md:text-sm mb-2 @sm:mb-3 @md:mb-4 truncate">
                                    {getAwarder(award)}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 @sm:gap-2 @md:gap-2.5 mb-2 @sm:mb-3 @md:mb-4">
                                {award.award_date && (
                                    <div className="flex items-center gap-1 @sm:gap-1.5 text-[9px] @sm:text-[10px] @md:text-xs text-gray-400 bg-black/30 w-fit px-2 @sm:px-2.5 @md:px-3 py-0.5 @sm:py-1 rounded-full border border-[#444]">
                                        <Calendar className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 flex-shrink-0" />
                                        <span>{formatDate(award.award_date)}</span>
                                    </div>
                                )}
                                {award.category && (
                                    <span className="text-[9px] @sm:text-[10px] @md:text-xs px-2 @sm:px-2.5 @md:px-3 py-0.5 @sm:py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                                        {award.category}
                                    </span>
                                )}
                            </div>

                            {award.description && (
                                <p className="text-gray-300 text-[10px] @sm:text-xs @md:text-sm leading-relaxed">
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
