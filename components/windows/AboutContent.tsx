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
    getProfile().then(p => setProfile(p as unknown as ProfileData));
  }, []);

  if (!profile) return <div className="p-8 text-white bg-[#1E1E1E] h-full">Loading profile...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1E1E1E] @container">
      {/* Banner */}
      <div className="w-full relative shrink-0 block">
        <ImageWithFallback imagePath={((profile as unknown as Record<string, unknown>)?.banner_path as string) || "profile/banner.webp"} alt="Banner" width={800} height={200} className="w-full h-auto max-h-40 @sm:max-h-48 object-cover object-center border-b border-[#3E3E3E]" priority />
        <div className="absolute -bottom-12 @sm:-bottom-14 @md:-bottom-16 left-4 @sm:left-6 @md:left-8">
          <div className="w-24 @sm:w-28 @md:w-32 h-24 @sm:h-28 @md:h-32 rounded-full border-4 border-[#1E1E1E] overflow-hidden bg-gray-800 shadow-xl relative text-5xl flex items-center justify-center">
            {profile ? (
                <ImageWithFallback
                    imagePath={resolveImagePath("profile", profile as unknown as Record<string, unknown>) || ""}
                    alt={profile.full_name}
                    width={IMAGE_SIZES.avatar.width}
                    height={IMAGE_SIZES.avatar.height}
                    className="w-full h-full"
                />
            ) : (
                <Image src="/linux-placeholder.webp" alt="Avatar Fallback" fill sizes="128px" className="object-contain bg-[#1E1E1E]" />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-14 @sm:mt-16 @md:mt-20 px-4 @sm:px-6 @md:px-8 pb-6 @sm:pb-8 text-white cursor-default">
        <h1 className="text-xl @sm:text-2xl @md:text-3xl font-bold mb-1">{profile.full_name}</h1>
        <h3 className="text-base @sm:text-lg @md:text-xl text-orange-500 font-medium mb-2 @sm:mb-3">{profile.headline}</h3>

        {profile.location && (
          <div className="flex items-center gap-2 text-gray-400 mb-3 @sm:mb-4 @md:mb-6 font-medium text-xs @sm:text-sm">
            <MapPin className="w-3 h-3 @sm:w-4 @sm:h-4 flex-shrink-0" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Bio Section */}
        <section className="mb-4 @sm:mb-6 @md:mb-8">
          <h2 className="text-base @sm:text-lg @md:text-xl font-semibold mb-2 @sm:mb-2.5 @md:mb-3 pb-2 border-b border-[#3E3E3E] text-gray-200">About</h2>
          <p className="text-xs @sm:text-sm @md:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
            {profile.about_description}
          </p>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-base @sm:text-lg @md:text-xl font-semibold mb-2 @sm:mb-2.5 @md:mb-3 pb-2 border-b border-[#3E3E3E] text-gray-200">Contact</h2>
          <div className="flex flex-col gap-1.5 @sm:gap-2 @md:gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 @sm:gap-3 p-2 @sm:p-3 @md:p-4 bg-[#2C2C2C] border border-[#3E3E3E] rounded-xl hover:border-orange-500/50 hover:bg-[#353535] transition-colors w-full @sm:max-w-[280px] @md:max-w-[320px]"
            >
              <div className="w-7 h-7 @sm:w-8 @sm:h-8 @md:w-10 @md:h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                 <Mail className="w-3.5 h-3.5 @sm:w-4 @sm:h-4 @md:w-5 @md:h-5" />
              </div>
              <span className="font-medium text-gray-200 text-xs @sm:text-sm @md:text-base truncate">{profile.email}</span>
            </a>

            {profile.contact_number && (
                <a
                  href={`tel:${profile.contact_number}`}
                  className="flex items-center gap-2 @sm:gap-3 p-2 @sm:p-3 @md:p-4 bg-[#2C2C2C] border border-[#3E3E3E] rounded-xl hover:border-orange-500/50 hover:bg-[#353535] transition-colors w-full @sm:max-w-[280px] @md:max-w-[320px]"
                >
                  <div className="w-7 h-7 @sm:w-8 @sm:h-8 @md:w-10 @md:h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                     <Phone className="w-3.5 h-3.5 @sm:w-4 @sm:h-4 @md:w-5 @md:h-5" />
                  </div>
                  <span className="font-medium text-gray-200 text-xs @sm:text-sm @md:text-base">{profile.contact_number}</span>
                </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
