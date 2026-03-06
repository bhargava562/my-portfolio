"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We would send this to Sentry or an external logger in a real environment
    console.error("Critical UI Crash Recovered:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1e1e1e] text-white font-ubuntu">
      <div className="bg-[#2c001e] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">System Recovered</h2>
          <p className="text-[#aea79f] text-sm">
            The Ubuntu interface encountered an unexpected fault in a deep component. 
            The system successfully quarantined the error to prevent a hard crash.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#e95420] hover:bg-[#d94a1d] transition-colors rounded-lg font-medium shadow-lg"
        >
          <RefreshCcw className="w-4 h-4" />
          Restart Interface
        </button>
      </div>
    </div>
  );
}
