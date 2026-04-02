"use client";

import { useEffect, useState } from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { getExperiences } from '@/lib/actions';

interface ExperienceData {
    id: number;
    company_name: string;
    role: string;
    start_date: Date | string | null;
    end_date?: Date | string | null;
    is_current: boolean;
    description: string | null;
    location: string | null;
    employment_type: string | null;
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
            <div className="relative w-full h-48 @sm:h-56 @md:h-64 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                <Image
                    src={imageArray[0]}
                    alt="Experience media"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>
        );
    }

    // Multi-image carousel
    return (
        <div className="flex flex-col gap-2 @sm:gap-2.5">
            <div className="relative w-full h-48 @sm:h-56 @md:h-64 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                <Image
                    src={imageArray[currentIndex]}
                    alt={`Experience media ${currentIndex + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>
            {/* Carousel Controls */}
            <div className="flex items-center justify-between gap-2 @sm:gap-3">
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1))}
                    className="px-2 @sm:px-3 py-1 @sm:py-1.5 text-[10px] @sm:text-xs rounded bg-slate-200 text-slate-900 hover:bg-slate-300 transition-colors font-medium"
                >
                    ← Prev
                </button>
                <span className="text-[9px] @sm:text-[10px] text-slate-600 whitespace-nowrap">
                    {currentIndex + 1} / {imageArray.length}
                </span>
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1))}
                    className="px-2 @sm:px-3 py-1 @sm:py-1.5 text-[10px] @sm:text-xs rounded bg-slate-200 text-slate-900 hover:bg-slate-300 transition-colors font-medium"
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
                            idx === currentIndex ? 'bg-slate-900 w-6' : 'bg-slate-300'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
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

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Present';
        try {
            return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-900 bg-slate-50 h-full flex items-center justify-center">Loading experience...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-600 bg-slate-50 h-full flex items-center justify-center">{error}</div>;
    }

    if (experiences.length === 0) {
        return <div className="p-8 text-slate-600 bg-slate-50 h-full flex items-center justify-center">No experience found.</div>;
    }

    return (
        <div className="flex-1 p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 overflow-auto bg-slate-50 @container">
            {/* Header */}
            <div className="mb-4 @sm:mb-6 @md:mb-8">
                <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-bold text-slate-900 mb-1">
                    Work Experience
                </h1>
                <p className="text-[10px] @sm:text-xs @md:text-sm text-slate-600">
                    {experiences.length} {experiences.length === 1 ? 'position' : 'positions'}
                </p>
            </div>

            {/* Experience Cards */}
            <div className="space-y-3 @sm:space-y-4 @md:space-y-6">
                {experiences.map((exp) => (
                    <div
                        key={exp.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 @sm:p-4 @md:p-5 @lg:p-6 hover:shadow-lg transition-shadow duration-300"
                    >
                        {/* Card Header: Role + Company + Badge */}
                        <div className="mb-2 @sm:mb-3 @md:mb-4">
                            <div className="flex items-start justify-between gap-2 @sm:gap-3 mb-1 @sm:mb-1.5">
                                <h3 className="font-bold text-sm @sm:text-base @md:text-lg @lg:text-xl text-slate-900">
                                    {exp.role}
                                </h3>
                                {exp.employment_type && (
                                    <span className="text-[8px] @sm:text-[9px] @md:text-[10px] px-2 @sm:px-2.5 @md:px-3 py-0.5 @sm:py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0 whitespace-nowrap">
                                        {exp.employment_type}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] @sm:text-xs @md:text-sm font-semibold text-indigo-600">
                                {exp.company_name}
                            </p>
                        </div>

                        {/* Meta Row: Date & Location */}
                        <div className="flex flex-wrap gap-3 @sm:gap-4 @md:gap-5 mb-3 @sm:mb-4 @md:mb-5 pb-3 @sm:pb-4 @md:pb-5 border-b border-slate-200">
                            <div className="flex items-center gap-1.5 text-[9px] @sm:text-[10px] @md:text-xs text-slate-600">
                                <Calendar className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                    {formatDate(exp.start_date)} – {exp.is_current ? 'Present' : formatDate(exp.end_date || null)}
                                </span>
                            </div>
                            {exp.location && (
                                <div className="flex items-center gap-1.5 text-[9px] @sm:text-[10px] @md:text-xs text-slate-600">
                                    <MapPin className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                    <span>{exp.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Media + Text Split Layout */}
                        <div className="flex flex-col @2xl:flex-row gap-3 @sm:gap-4 @md:gap-5 @lg:gap-6">
                            {/* Left: Text Content */}
                            <div className="flex-1 min-w-0">
                                {exp.description && (
                                    <p className="text-[10px] @sm:text-xs @md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {exp.description}
                                    </p>
                                )}
                            </div>

                            {/* Right: Media Carousel */}
                            {exp.image_paths && (
                                <div className="w-full @2xl:w-1/3 flex-shrink-0">
                                    <DynamicMediaCarousel images={exp.image_paths} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
