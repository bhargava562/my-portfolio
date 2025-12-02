import { useState } from 'react';
import { Wifi, Volume2, Sun, Power } from 'lucide-react';

export default function QuickSettings({ onClose }: { onClose: () => void }) {
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);
  const [wifiEnabled, setWifiEnabled] = useState(true);

  return (
    <div className="w-80 ubuntu-window-bg rounded-xl shadow-2xl p-4 text-white">
      {/* WiFi Toggle */}
      <button 
        onClick={() => setWifiEnabled(!wifiEnabled)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg mb-3 transition-colors ${
          wifiEnabled ? 'ubuntu-orange-bg' : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >
        <Wifi className="w-5 h-5" />
        <div className="flex-1 text-left">
          <div>Wi-Fi</div>
          {wifiEnabled && <div className="text-xs opacity-80">Connected</div>}
        </div>
      </button>

      {/* Volume Slider */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Volume2 className="w-5 h-5" />
          <span>Volume</span>
          <span className="ml-auto text-sm opacity-80">{volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
      </div>

      {/* Brightness Slider */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Sun className="w-5 h-5" />
          <span>Brightness</span>
          <span className="ml-auto text-sm opacity-80">{brightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600 my-3" />

      {/* Power Button */}
      <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
        <Power className="w-5 h-5" />
        <span>Power Off / Log Out</span>
      </button>
    </div>
  );
}
