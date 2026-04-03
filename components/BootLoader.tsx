"use client";

import { useEffect } from 'react';

interface BootLoaderProps {
  onSkip: () => void;
}

const LogLine = ({ text, delay }: { text: string, delay: number }) => (
  <div className="opacity-0 flex items-center justify-between sm:w-[28rem] w-full" style={{ animation: `fadeIn 0.1s ease-out ${delay}ms forwards` }}>
    <div className="flex-1 truncate pr-2">
      <span className="text-green-500 font-bold">[ OK ]</span> {text}
    </div>
    <div className="w-16 sm:w-24 h-1.5 bg-gray-800 rounded overflow-hidden shrink-0">
      {/* Use standard CSS inline animation with delay so the width climbs smoothly */ }
      <div className="h-full bg-green-500 w-0" style={{ animation: `progress 0.5s ease-out ${delay + 50}ms forwards` }} />
    </div>
  </div>
);

export default function BootLoader({ onSkip }: BootLoaderProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  return (
    <div className="absolute inset-0 bg-black text-green-500 font-mono p-4 sm:p-8 flex flex-col justify-between overflow-hidden cursor-default select-none">
      <div>
        <div className="mb-6 opacity-70 text-gray-300">
          <div>GNU GRUB version 2.06</div>
          <div>Initializing Portfolio OS...</div>
        </div>
        
        <div className="space-y-1.5 text-sm sm:text-base">
          {/* We simulate CSS typing delays using mapping bounds on simple fade-ins */}
          <LogLine text="Initializing Portfolio Kernel..." delay={0} />
          <LogLine text="Mounting Skills Filesystem..." delay={800} />
          <LogLine text="Loading Projects..." delay={1600} />
          <LogLine text="Connecting Supabase Services..." delay={2400} />
          <LogLine text="Starting UI Engine..." delay={3200} />
          <LogLine text="Boot Complete. Switching to Display Manager..." delay={3800} />
          
          <div className="animate-pulse font-bold text-white mt-1">_</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-xs mb-1 opacity-70 text-gray-300">
          <span>Booting system...</span>
          <span className="animate-pulse">Loading modules...</span>
        </div>
        <div className="w-full max-w-md h-2 bg-gray-800 rounded overflow-hidden">
          {/* The animate-progress hook operates exactly over a 4s timeline */}
          <div className="h-full bg-green-500 animate-[progress_4s_ease-out_forwards]" />
        </div>
      </div>

      {/* Accessibility hidden skip button */}
      <button 
        onClick={onSkip}
        className="opacity-0 focus:opacity-100 absolute bottom-4 right-4 text-xs text-gray-500 hover:text-white transition-opacity"
      >
        Skip Animation (Esc)
      </button>
    </div>
  );
}