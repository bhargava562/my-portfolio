import React, { useState } from 'react';

interface BrowserProps {
    initialUrl?: string;
}

export default function Browser({ initialUrl = 'https://google.com' }: BrowserProps) {
    const [url, setUrl] = useState(initialUrl);

    return (
        <div className="w-full h-full bg-white flex flex-col">
            {/* Toolbar */}
            <div className="h-10 bg-[#F5F5F5] border-b border-[#DCDCDC] flex items-center px-2 gap-2">
                <div className="flex gap-1">
                    <button className="w-7 h-7 rounded hover:bg-[#EBEBEB] flex items-center justify-center text-[#5E5E5E]">←</button>
                    <button className="w-7 h-7 rounded hover:bg-[#EBEBEB] flex items-center justify-center text-[#5E5E5E]">→</button>
                    <button className="w-7 h-7 rounded hover:bg-[#EBEBEB] flex items-center justify-center text-[#5E5E5E]">↻</button>
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full h-8 bg-white border border-[#DCDCDC] rounded px-3 text-sm text-[#3E3E3E] focus:outline-none focus:border-[#E95420]"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white relative">
                {/* Placeholder for actual browser content or iframe if needed */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Browser Content for {url}
                    <br />
                    (This is a mock browser)
                </div>
            </div>
        </div>
    );
}
