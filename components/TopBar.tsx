"use client";

import { useState, useEffect } from 'react';
import { Wifi, Volume2, Battery, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QuickSettings from './QuickSettings';
import CalendarDropdown from './CalendarDropdown';

export default function TopBar() {
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayName = days[now.getDay()];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${dayName} ${month} ${day} ${hours}:${minutes}`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-7 ubuntu-header-bg backdrop-blur-sm z-50 flex items-center justify-between px-2 text-white">
        {/* Left: Activities */}
        <button className="px-3 py-0.5 hover:bg-white/10 rounded transition-colors">
          Activities
        </button>

        {/* Center: Date & Time */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-3 py-0.5 hover:bg-white/10 rounded transition-colors"
        >
          {getCurrentDateTime()}
        </button>

        {/* Right: System Tray */}
        <button
          onClick={() => setShowQuickSettings(!showQuickSettings)}
          className="flex items-center gap-2 px-2 py-0.5 hover:bg-white/10 rounded transition-colors"
        >
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Settings Dropdown */}
      <AnimatePresence>
        {showQuickSettings && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowQuickSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed top-8 right-2 z-50"
            >
              <QuickSettings onClose={() => setShowQuickSettings(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {showCalendar && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowCalendar(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
            >
              <CalendarDropdown onClose={() => setShowCalendar(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
