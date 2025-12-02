import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CalendarDropdown({ onClose }: { onClose: () => void }) {
  const [currentDate] = useState(new Date());
  
  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { firstDay, daysInMonth, currentDay: currentDate.getDate() };
  };

  const { firstDay, daysInMonth, currentDay } = getMonthData();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(
      <div
        key={i}
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          i === currentDay ? 'ubuntu-orange-bg text-white' : 'hover:bg-gray-700'
        }`}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="w-80 ubuntu-window-bg rounded-xl shadow-2xl p-4 text-white">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-gray-700 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button className="p-1 hover:bg-gray-700 rounded">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="w-8 h-8 flex items-center justify-center text-xs opacity-60">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}
