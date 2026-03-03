"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, ExternalLink } from 'lucide-react';
import { getBlogs, getImageUrl } from '@/lib/actions';
import Image from 'next/image';

interface BlogData {
    id: string;
    title: string;
    excerpt: string | null;
    published_at: Date | null;
    reading_time: string | null;
    url: string | null;
    cover_image_path: string | null;
}

export default function BlogsContent() {
    const [blogs, setBlogs] = useState<BlogData[]>([]);
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        getBlogs().then(setBlogs);
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (blogs.length === 0) {
        return <div className="p-8 text-white h-full bg-[#1E1E1E]">No blogs found or loading...</div>;
    }

    return (
        <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E] h-full">
            <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold">Articles & Blogs</h1>
            </div>
            
            <div className="flex flex-col gap-6">
                {blogs.map((blog) => (
                    <div key={blog.id} className="flex flex-col md:flex-row bg-[#2C2C2C] rounded-xl overflow-hidden border border-[#3E3E3E] group hover:border-blue-400/50 transition-colors">
                        {blog.cover_image_path && !imgErrors[blog.id] ? (
                            <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-800 shrink-0">
                                <Image 
                                    src={getImageUrl(blog.cover_image_path)} 
                                    alt={blog.title} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    onError={() => setImgErrors(prev => ({ ...prev, [blog.id]: true }))}
                                />
                            </div>
                        ) : (
                            <div className="w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-blue-900/40 to-purple-900/40 shrink-0 flex items-center justify-center border-r border-[#3E3E3E]">
                                <BookOpen className="w-12 h-12 text-blue-400/50" />
                            </div>
                        )}
                        
                        <div className="flex flex-col flex-1 p-6 justify-center">
                            <h3 className="font-bold text-xl text-gray-100 mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {blog.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400 mb-4">
                                {blog.published_at && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(blog.published_at)}</span>
                                    </div>
                                )}
                                {blog.reading_time && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{blog.reading_time}</span>
                                    </div>
                                )}
                            </div>

                            {blog.excerpt && (
                                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {blog.excerpt}
                                </p>
                            )}
                            
                            {blog.url && (
                                <a 
                                  href={blog.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors w-fit"
                                >
                                    Read Article <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
