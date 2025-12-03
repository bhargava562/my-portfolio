import React from 'react';

interface TextEditorProps {
    content: React.ReactNode;
}

export default function TextEditor({ content }: TextEditorProps) {
    return (
        <div className="w-full h-full bg-white flex flex-col font-ubuntu-mono">
            {/* Toolbar */}
            <div className="h-10 bg-[#F5F5F5] border-b border-[#DCDCDC] flex items-center px-4 gap-4 text-sm text-[#5E5E5E]">
                <button className="hover:bg-[#EBEBEB] px-2 py-1 rounded">File</button>
                <button className="hover:bg-[#EBEBEB] px-2 py-1 rounded">Edit</button>
                <button className="hover:bg-[#EBEBEB] px-2 py-1 rounded">View</button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto text-[#3E3E3E] selection:bg-[#E95420] selection:text-white">
                {content}
            </div>
        </div>
    );
}
