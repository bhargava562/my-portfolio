"use client";

import Image from 'next/image';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden cursor-default select-none">
      {/* Background with blur and gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-orange-600/60 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#1E1E1E] shadow-2xl relative mb-4 sm:mb-6">
          <Image
            src={process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL.endsWith('/') ? '' : '/'}profile/profile.webp` : "/linux-placeholder.webp"}
            alt="Bhargava"
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover"
            priority
          />
        </div>

        {/* User Name */}
        <h1 className="text-3xl font-bold text-white mb-8 tracking-wide drop-shadow-md">
          Bhargava A
        </h1>

        {/* Unlock Button */}
        <button
          onClick={onUnlock}
          className="cursor-pointer px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 group"
        >
          <span className="flex items-center gap-2">
            ENTER DESKTOP
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 font-bold">
              →
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
