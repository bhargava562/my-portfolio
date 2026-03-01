"use client";

import { useWindows } from './WindowManager';
import Window from './Window';

export default function WindowContainer() {
  const { windows } = useWindows();

  return (
    <div className="fixed inset-0 pointer-events-none z-10" style={{ top: '28px', left: '64px' }}>
      {windows.map((window) => (
        !window.isMinimized && (
          <Window key={window.id} windowData={window} />
        )
      ))}
    </div>
  );
}
