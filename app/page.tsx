"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { WindowProvider } from "@/components/WindowManager";
import TopBar from "@/components/TopBar";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import WindowContainer from "@/components/WindowContainer";
import BootOverlay from "@/components/BootOverlay";
import { BootProvider } from "@/hooks/useBootState";

// Dynamic import Desktop with ssr: false to prevent hydration mismatch
const Desktop = dynamic(() => import("@/components/Desktop"), { ssr: false });

export default function Home() {
  return (
    <BootProvider>
      <WindowProvider>
        <div className="relative h-screen w-screen overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=90"
            alt="Ubuntu Wallpaper"
            fill
            sizes="100vw"
            className="object-cover object-center -z-10"
            priority
          />
          {/* Wallpaper overlay for Ubuntu gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-orange-600/40" />

          {/* Top Navigation Bar (hidden on mobile) */}
          <TopBar />

          {/* Responsive Navigation: Left sidebar on desktop, bottom bar on mobile */}
          <ResponsiveNavigation />

          {/* Desktop Surface with app icons */}
          <Desktop />

          {/* Window Container (fullscreen on mobile, floating on desktop) */}
          <WindowContainer />
        </div>
      </WindowProvider>
      <BootOverlay />
    </BootProvider>
  );
}
