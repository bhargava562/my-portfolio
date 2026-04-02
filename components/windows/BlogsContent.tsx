"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, ExternalLink } from 'lucide-react';
import { getBlogs, getImageUrl } from '@/lib/actions';
import Image from 'next/image';

interface BlogData {
    id: string;
    title: string;
    excerpt: string | null;
    published_at: Date | string | null;
    reading_time: string | number | null;
    url?: string | null;
    cover_image_path: string | null;
    slug?: string | null;
}

export default function BlogsContent() {
    const [blogs, setBlogs] = useState<BlogData[]>([]);
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
    const [imgTimeouts, setImgTimeouts] = useState<Record<string, boolean>>({});
    const [fallbackImages, setFallbackImages] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const timeoutRefs = useState<Record<string, NodeJS.Timeout>>(() => ({}))[0];

    useEffect(() => {
        getBlogs()
            .then(b => {
                setBlogs(b as unknown as BlogData[]);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load blogs:', err);
                setError('Failed to load blogs.');
                setLoading(false);
            });

        // Cleanup timeouts on unmount
        return () => {
            Object.values(timeoutRefs).forEach(timeout => clearTimeout(timeout));
        };
    }, [timeoutRefs]);

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    };

    const formatReadingTime = (time: string | number | null) => {
        if (!time) return '';
        if (typeof time === 'number') return `${time} min read`;
        return time;
    };

    if (loading) {
        return (
            <div className="p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 text-white h-full bg-[#1E1E1E] flex items-center justify-center @container">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-sm @sm:text-base text-gray-400">Loading articles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 text-red-400 h-full bg-[#1E1E1E] flex items-center justify-center @container">
                <div className="text-center">
                    <p className="text-sm @sm:text-base font-semibold mb-2">Error</p>
                    <p className="text-xs @sm:text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 text-gray-400 h-full bg-[#1E1E1E] flex items-center justify-center @container">
                <div className="text-center">
                    <BookOpen className="w-12 h-12 @sm:w-14 @sm:h-14 @md:w-16 @md:h-16 mx-auto mb-3 @sm:mb-4 opacity-50" />
                    <p className="text-sm @sm:text-base">No articles found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-2 @sm:p-3 @md:p-4 @lg:p-6 @xl:p-8 overflow-auto text-white bg-[#1E1E1E] h-full @container">
            <div className="flex items-center gap-2 @sm:gap-2.5 @md:gap-3 mb-4 @sm:mb-6 @md:mb-8">
                <BookOpen className="w-5 h-5 @sm:w-6 @sm:h-6 @md:w-8 @md:h-8 text-blue-400 flex-shrink-0" />
                <div>
                    <h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-bold text-white">
                        Articles & Blogs
                    </h1>
                    <p className="text-[9px] @sm:text-[10px] @md:text-xs text-blue-400">
                        {blogs.length} {blogs.length === 1 ? 'article' : 'articles'}
                    </p>
                </div>
            </div>

            <div className="space-y-3 @sm:space-y-4 @md:space-y-5 @lg:space-y-6">
                {blogs.map((blog) => (
                    <div key={blog.id} className="flex flex-col @2xl:flex-row bg-[#2C2C2C] rounded-lg overflow-hidden border border-[#3E3E3E] group hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                        {blog.cover_image_path && !imgErrors[blog.id] && !imgTimeouts[blog.id] ? (
                            <div className="w-full @2xl:w-56 h-36 @sm:h-44 @md:h-52 @2xl:h-auto relative bg-gray-800 shrink-0">
                                <Image
                                    src={fallbackImages[blog.id] ? '/assets/linux_placeholder.webp' : getImageUrl(blog.cover_image_path)}
                                    alt={blog.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 224px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    onLoadingComplete={() => {
                                        if (timeoutRefs[blog.id]) {
                                            clearTimeout(timeoutRefs[blog.id]);
                                            delete timeoutRefs[blog.id];
                                        }
                                    }}
                                    onError={() => {
                                        if (timeoutRefs[blog.id]) {
                                            clearTimeout(timeoutRefs[blog.id]);
                                            delete timeoutRefs[blog.id];
                                        }
                                        // First try fallback image
                                        if (!fallbackImages[blog.id]) {
                                            console.warn(`[BlogsContent] Primary image failed for blog: ${blog.title}, using fallback`);
                                            setFallbackImages(prev => ({ ...prev, [blog.id]: true }));
                                        } else {
                                            // If fallback also fails, mark as error
                                            console.warn(`[BlogsContent] Fallback image also failed for blog: ${blog.title}`);
                                            setImgErrors(prev => ({ ...prev, [blog.id]: true }));
                                        }
                                    }}
                                    onLoadStart={() => {
                                        // Set 10 second timeout for image loading
                                        timeoutRefs[blog.id] = setTimeout(() => {
                                            console.warn(`[BlogsContent] Image load timeout for blog: ${blog.title}`);
                                            setImgTimeouts(prev => ({ ...prev, [blog.id]: true }));
                                        }, 10000);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-full @2xl:w-56 h-36 @sm:h-44 @md:h-52 @2xl:h-auto bg-gradient-to-br from-blue-900/40 to-purple-900/40 shrink-0 flex items-center justify-center border-b @2xl:border-r @2xl:border-b-0 border-[#3E3E3E]">
                                <BookOpen className="w-10 h-10 @sm:w-12 @sm:h-12 @md:w-14 @md:h-14 text-blue-400/50" />
                            </div>
                        )}

                        <div className="flex flex-col flex-1 p-3 @sm:p-4 @md:p-5 @lg:p-6 justify-between gap-2 @sm:gap-2.5 @md:gap-3">
                            <div>
                                <h3 className="font-bold text-sm @sm:text-base @md:text-lg @lg:text-xl text-gray-100 mb-2 @sm:mb-2.5 @md:mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {blog.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 @sm:gap-2.5 @md:gap-3 text-[8px] @sm:text-[9px] @md:text-[10px] @lg:text-xs font-medium text-gray-400 mb-2 @sm:mb-3 @md:mb-4">
                                    {blog.published_at && (
                                        <div className="flex items-center gap-1 @sm:gap-1.5">
                                            <Calendar className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap">{formatDate(blog.published_at)}</span>
                                        </div>
                                    )}
                                    {blog.reading_time && (
                                        <div className="flex items-center gap-1 @sm:gap-1.5">
                                            <Clock className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap">{formatReadingTime(blog.reading_time)}</span>
                                        </div>
                                    )}
                                </div>

                                {blog.excerpt && (
                                    <p className="text-gray-300 text-[9px] @sm:text-[10px] @md:text-xs @lg:text-sm leading-relaxed line-clamp-3">
                                        {blog.excerpt}
                                    </p>
                                )}
                            </div>

                            {blog.url && (
                                <a
                                  href={blog.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 @sm:mt-2.5 @md:mt-3 inline-flex items-center gap-1.5 @sm:gap-2 text-[8px] @sm:text-[9px] @md:text-xs @lg:text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors w-fit"
                                >
                                    Read Article <ExternalLink className="w-3 h-3 @sm:w-3.5 @sm:h-3.5 @md:w-4 @md:h-4 flex-shrink-0" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
