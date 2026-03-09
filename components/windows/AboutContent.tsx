"use client";

import { useEffect, useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getProfile } from '@/lib/actions';
import Image from 'next/image';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { resolveImagePath } from '@/lib/image-field';
import { IMAGE_SIZES } from '@/lib/image-sizes';

interface ProfileData {
  id: number;
  full_name: string;
  headline: string;
  about_description: string;
  email: string;
  contact_number: string;
  location: string | null;
  profile_image_path: string | null;
  resume_path: string | null;
}

export default function AboutContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) return <div className="p-8 text-white bg-[#1E1E1E] h-full">Loading profile...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1E1E1E]">
      {/* Banner */}
      <div className="w-full relative shrink-0 block">
        <ImageWithFallback imagePath={((profile as unknown as Record<string, unknown>)?.banner_path as string) || "profile/banner.webp"} alt="Banner" width={800} height={200} className="w-full h-auto max-h-48 object-cover object-center border-b border-[#3E3E3E]" priority />
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-[#1E1E1E] overflow-hidden bg-gray-800 shadow-xl relative text-5xl flex items-center justify-center">
            {profile ? (
                <ImageWithFallback 
                    imagePath={resolveImagePath("profile", profile as unknown as Record<string, unknown>) || ""}
                    alt={profile.full_name} 
                    width={IMAGE_SIZES.avatar.width}
                    height={IMAGE_SIZES.avatar.height}
                    className="w-full h-full" 
                />
            ) : (
                <Image src="/linux-placeholder.webp" alt="Avatar Fallback" fill className="object-contain bg-[#1E1E1E]" />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-20 px-8 pb-8 text-white cursor-default">
        <h1 className="text-3xl font-bold mb-1">{profile.full_name}</h1>
        <h3 className="text-orange-500 text-xl font-medium mb-3">{profile.headline}</h3>
        
        {profile.location && (
          <div className="flex items-center gap-2 text-gray-400 mb-6 font-medium">
            <MapPin className="w-4 h-4" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Bio Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-[#3E3E3E] text-gray-200">About</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {profile.about_description}
          </p>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-[#3E3E3E] text-gray-200">Contact</h2>
          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 p-4 bg-[#2C2C2C] border border-[#3E3E3E] rounded-xl hover:border-orange-500/50 hover:bg-[#353535] transition-colors w-fit min-w-[300px]"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                 <Mail className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-200">{profile.email}</span>
            </a>
            
            {profile.contact_number && (
                <a
                  href={`tel:${profile.contact_number}`}
                  className="flex items-center gap-3 p-4 bg-[#2C2C2C] border border-[#3E3E3E] rounded-xl hover:border-orange-500/50 hover:bg-[#353535] transition-colors w-fit min-w-[300px]"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                     <Phone className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-200">{profile.contact_number}</span>
                </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
