"use client";

import { useEffect, useState } from 'react';
import { getSocialLinks, getUiConfigData } from '@/lib/actions';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { resolveImagePath } from '@/lib/image-field';
import { IMAGE_SIZES } from '@/lib/image-sizes';

export default function SocialsContent() {
    const [socialLinks, setSocialLinks] = useState<Record<string, unknown>[]>([]);
    const [uiConfig, setUiConfig] = useState<Record<string, unknown>>({});

    useEffect(() => {
        getSocialLinks().then(setSocialLinks);
        getUiConfigData().then(setUiConfig);
    }, []);

    if (socialLinks.length === 0) {
        return <div className="p-8 text-white bg-[#1E1E1E]">Loading social links...</div>;
    }

    const socialsConfig = (uiConfig?.socials as Record<string, unknown>) || {};
    const platformStyles = (socialsConfig.platformStyles as Record<string, Record<string, string | null>>) || {};
    const defaultStyleStr = (socialsConfig.defaultStyle as Record<string, string | null>) || {};

    const defaultStyle = {
        color: defaultStyleStr.color || '#E95420',
        bgColor: defaultStyleStr.bgColor || 'rgba(233, 84, 32, 0.15)',
        icon: <ExternalLink className="w-6 h-6" />,
    };

    return (
        <div className="flex flex-col h-full w-full p-8 overflow-y-auto text-white bg-[#1E1E1E]">
            <h1 className="text-2xl font-bold mb-8 flex-shrink-0">Connect With Me</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
                {socialLinks.map((link, index) => {
                    const platformName = String(link.platform || link.platformName || "Unknown");
                    const iconKey = platformName.toLowerCase();
                    const url = String(link.url || "");
                    
                    const configStyle = platformStyles[iconKey];
                    const style = configStyle ? {
                        color: configStyle.color || defaultStyle.color,
                        bgColor: configStyle.bgColor || defaultStyle.bgColor,
                        icon: configStyle.iconIdentifier ? <Image src="/linux-placeholder.webp" alt={platformName} width={28} height={28} className="object-contain" /> : defaultStyle.icon,
                    } : defaultStyle;
                    
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
