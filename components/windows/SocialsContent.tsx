"use client";

import { useEffect, useState } from 'react';
import { getSocialLinks } from '@/lib/actions';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { resolveImagePath } from '@/lib/image-field';
import { IMAGE_SIZES } from '@/lib/image-sizes';

// Platform-specific colors and SVG icons
const platformStyles: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
    linkedin: {
        color: '#0A66C2',
        bgColor: 'rgba(10, 102, 194, 0.15)',
        icon: <Image src="/linux-placeholder.webp" alt="LinkedIn" width={28} height={28} className="object-contain" />,
    },
    github: {
        color: '#fff',
        bgColor: 'rgba(255, 255, 255, 0.1)',
        icon: <Image src="/linux-placeholder.webp" alt="GitHub" width={28} height={28} className="object-contain" />,
    },
    x: {
        color: '#fff',
        bgColor: 'rgba(0, 0, 0, 0.8)',
        icon: <Image src="/linux-placeholder.webp" alt="Twitter/X" width={28} height={28} className="object-contain" />,
    },
    twitter: {
        color: '#fff',
        bgColor: 'rgba(0, 0, 0, 0.8)',
        icon: <Image src="/linux-placeholder.webp" alt="Twitter/X" width={28} height={28} className="object-contain" />,
    },
    stackoverflow: {
        color: '#F58025',
        bgColor: 'rgba(245, 128, 37, 0.15)',
        icon: <Image src="/linux-placeholder.webp" alt="StackOverflow" width={28} height={28} className="object-contain" />,
    },
    leetcode: {
        color: '#FFA116',
        bgColor: 'rgba(255, 161, 22, 0.15)',
        icon: <Image src="/linux-placeholder.webp" alt="LeetCode" width={28} height={28} className="object-contain" />,
    },
    hackerrank: {
        color: '#00EA64',
        bgColor: 'rgba(0, 234, 100, 0.15)',
        icon: <Image src="/linux-placeholder.webp" alt="HackerRank" width={28} height={28} className="object-contain" />,
    },
    skillrack: {
        color: '#4285F4',
        bgColor: 'rgba(66, 133, 244, 0.15)',
        icon: <Image src="/linux-placeholder.webp" alt="SkillRack" width={28} height={28} className="object-contain" />,
    },
    unstop: {
        color: '#1C4980',
        bgColor: 'rgba(28, 73, 128, 0.15)',
        icon: <Image src="/linux-placeholder.webp" alt="Unstop" width={28} height={28} className="object-contain" />,
    }
};

const defaultStyle = {
    color: '#E95420',
    bgColor: 'rgba(233, 84, 32, 0.15)',
    icon: <ExternalLink className="w-6 h-6" />,
};

export default function SocialsContent() {
    const [socialLinks, setSocialLinks] = useState<Record<string, string | number>[]>([]);

    useEffect(() => {
        getSocialLinks().then(setSocialLinks);
    }, []);

    if (socialLinks.length === 0) {
        return <div className="p-8 text-white bg-[#1E1E1E]">Loading social links...</div>;
    }

    return (
        <div className="flex flex-col h-full w-full p-8 overflow-y-auto text-white bg-[#1E1E1E]">
            <h1 className="text-2xl font-bold mb-8 flex-shrink-0">Connect With Me</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
                {socialLinks.map((link, index) => {
                    const platformName = String(link.platform || link.platformName || "Unknown");
                    const iconKey = platformName.toLowerCase();
                    const url = String(link.url || "");
                    
                    const style = platformStyles[iconKey] || defaultStyle;
                    
                    const imgPath = resolveImagePath("social_profiles", link as unknown as Record<string, unknown>);
                    const styleIconSrc = style.icon && (style.icon as React.ReactElement<{src?: string}>).props?.src;
                    const hasIconImg = imgPath || styleIconSrc;
                    
                    return (
                        <a
                            key={link.id ? String(link.id) : `social-link-${index}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-[#3E3E3E] hover:scale-105 transition-all duration-200 group"
                            style={{ backgroundColor: style.bgColor }}
                        >
                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 mb-2 ${hasIconImg ? 'relative overflow-hidden' : ''}`}
                                style={{ color: style.color }}
                            >
                                {hasIconImg ? (
                                    <ImageWithFallback
                                        imagePath={imgPath || ""}
                                        alt={platformName}
                                        width={IMAGE_SIZES.icon.width}
                                        height={IMAGE_SIZES.icon.height}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    style.icon
                                )}
                            </div>
                            <span className="font-medium text-center text-sm">{platformName}</span>
                            <span
                                className="text-xs px-3 py-1 rounded-full mt-auto"
                                style={{ backgroundColor: style.color, color: '#000' }}
                            >
                                Visit →
                            </span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
