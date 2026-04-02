"use client";

import { useEffect, useState } from 'react';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { getHackathons } from '@/lib/actions';

interface HackathonData {
    id: string;
    name: string;
    organizer: string | null;
    event_start_date: Date | null;
    description: string | null;
    category: string | null;
    position: string | null;
    location?: string | null;
    image_paths?: string | string[] | null;
}

// ─── Reusable Media Carousel Component ───────────────────────────────
interface DynamicMediaCarouselProps {
    images?: string | string[] | null;
}

function DynamicMediaCarousel({ images }: DynamicMediaCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Return null if no images
    if (!images || (Array.isArray(images) && images.length === 0)) {
        return null;
    }

    const imageArray = Array.isArray(images) ? images : [images];

    if (imageArray.length === 1) {
        return (
            <div className="relative w-full h-48 @sm:h-56 @md:h-64 rounded-lg overflow-hidden shadow-lg flex-shrink-0 border border-violet-500/30">
                <Image
                    src={imageArray[0]}
                    alt="Hackathon media"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>
        );
    }

    // Multi-image carousel
    return (
        <div className="flex flex-col gap-2 @sm:gap-2.5">
            <div className="relative w-full h-48 @sm:h-56 @md:h-64 rounded-lg overflow-hidden shadow-lg flex-shrink-0 border border-violet-500/30">
                <Image
                    src={imageArray[currentIndex]}
                    alt={`Hackathon media ${currentIndex + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>
            {/* Carousel Controls */}
            <div className="flex items-center justify-between gap-2 @sm:gap-3">
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1))}
                    className="px-2 @sm:px-3 py-1 @sm:py-1.5 text-[10px] @sm:text-xs rounded bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 transition-colors font-medium border border-violet-500/30"
                >
                    ← Prev
                </button>
                <span className="text-[9px] @sm:text-[10px] text-violet-400 whitespace-nowrap">
                    {currentIndex + 1} / {imageArray.length}
                </span>
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1))}
                    className="px-2 @sm:px-3 py-1 @sm:py-1.5 text-[10px] @sm:text-xs rounded bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 transition-colors font-medium border border-violet-500/30"
                >
                    Next →
                </button>
            </div>
            {/* Scroll-snap dots */}
            <div className="flex justify-center gap-1.5">
                {imageArray.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentIndex ? 'bg-violet-500 w-6' : 'bg-violet-500/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
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
        return <div className="p-8 text-white bg-[#0f0f12] h-full flex items-center justify-center">Loading hackathons...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-400 bg-[#0f0f12] h-full flex items-center justify-center">{error}</div>;
    }

    if (hackathons.length === 0) {
        return <div className="p-8 text-gray-400 bg-[#0f0f12] h-full flex items-center justify-center">No hackathons found.</div>;
    }

    return (
        <div className="flex-1 p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 overflow-auto text-white bg-gradient-to-br from-[#0f0f12] to-[#1a1a1f] @container">
            {/* Header */}
            <div className="flex items-center gap-2 @sm:gap-2.5 @md:gap-3 mb-4 @sm:mb-6 @md:mb-8">
                <Trophy className="w-5 h-5 @sm:w-6 @sm:h-6 @md:w-8 @md:h-8 text-violet-500 flex-shrink-0" />
                <div>
                    <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-bold text-white">
                        Hackathons & Competitions
                    </h1>
                    <p className="text-[9px] @sm:text-[10px] @md:text-xs text-violet-400">
                        {hackathons.length} {hackathons.length === 1 ? 'event' : 'events'}
                    </p>
                </div>
            </div>

            {/* Hackathon Cards */}
            <div className="space-y-3 @sm:space-y-4 @md:space-y-5 @lg:space-y-6">
                {hackathons.map((hack) => (
                    <div
                        key={hack.id}
                        className="relative bg-[#1a1c23] border border-violet-500/20 rounded-lg p-3 @sm:p-4 @md:p-5 @lg:p-6 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden group"
                    >
                        {/* Gradient accent on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Content relative z */}
                        <div className="relative z-10">
                            {/* Header: Name + Position Badge */}
                            <div className="flex items-start justify-between gap-2 @sm:gap-3 mb-2 @sm:mb-3 @md:mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm @sm:text-base @md:text-lg @lg:text-xl text-white group-hover:text-violet-300 transition-colors">
                                        {hack.name}
                                    </h3>
                                    {hack.organizer && (
                                        <p className="text-[9px] @sm:text-[10px] @md:text-xs text-gray-400 mt-0.5 @sm:mt-1 truncate">
                                            by {hack.organizer}
                                        </p>
                                    )}
                                </div>

                                {/* Trophy Badge - Position */}
                                {hack.position && (
                                    <div className="flex-shrink-0">
                                        <div className="relative px-2 @sm:px-3 @md:px-4 py-1 @sm:py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg shadow-lg shadow-violet-500/50 border border-violet-400/50">
                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                <Trophy className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 text-yellow-300" />
                                                <span className="text-[8px] @sm:text-[9px] @md:text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {hack.position}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Meta Row: Date & Category & Location */}
                            <div className="flex flex-wrap gap-2 @sm:gap-3 mb-3 @sm:mb-4 @md:mb-5 pb-3 @sm:pb-4 @md:pb-5 border-b border-violet-500/20">
                                <div className="flex items-center gap-1.5 text-[9px] @sm:text-[10px] @md:text-xs text-gray-400">
                                    <Calendar className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                    <span>{formatDate(hack.event_start_date)}</span>
                                </div>
                                {hack.category && (
                                    <div className="flex items-center gap-1.5 text-[9px] @sm:text-[10px] @md:text-xs text-gray-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 flex-shrink-0" />
                                        <span>{hack.category}</span>
                                    </div>
                                )}
                                {hack.location && (
                                    <div className="flex items-center gap-1.5 text-[9px] @sm:text-[10px] @md:text-xs text-gray-400">
                                        <MapPin className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                        <span>{hack.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Media + Text Split Layout (Image on Left for Variety) */}
                            <div className="flex flex-col @2xl:flex-row-reverse gap-3 @sm:gap-4 @md:gap-5 @lg:gap-6">
                                {/* Right: Text Content */}
                                <div className="flex-1 min-w-0">
                                    {hack.description && (
                                        <p className="text-[10px] @sm:text-xs @md:text-sm text-gray-300 leading-relaxed mb-2 @sm:mb-3">
                                            {hack.description}
                                        </p>
                                    )}
                                </div>

                                {/* Left: Media Carousel */}
                                {hack.image_paths && (
                                    <div className="w-full @2xl:w-1/3 flex-shrink-0">
                                        <DynamicMediaCarousel images={hack.image_paths} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
