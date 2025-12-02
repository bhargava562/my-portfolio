import Image from "next/image";
import { WindowProvider } from "@/components/WindowManager";
import TopBar from "@/components/TopBar";
import Dock from "@/components/Dock";
import Desktop from "@/components/Desktop";
import WindowContainer from "@/components/WindowContainer";

export default function Home() {
  return (
    <WindowProvider>
      <div className="relative h-screen w-screen overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=90"
          alt="Ubuntu Wallpaper"
          fill
          className="object-cover object-center -z-10"
          priority
        />
        {/* Wallpaper overlay for Ubuntu gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-orange-600/40" />

        {/* Top Navigation Bar */}
        <TopBar />

        {/* Left Dock */}
        <Dock />

        {/* Desktop Surface */}
        <Desktop />

        {/* Window Container */}
        <WindowContainer />
      </div>
    </WindowProvider>
  );
}
