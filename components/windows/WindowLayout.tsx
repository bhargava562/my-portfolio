import React, { ReactNode } from 'react';

interface WindowLayoutProps {
    title: ReactNode;
    sidebarContent?: ReactNode;
    children: ReactNode;
}

export default function WindowLayout({ title, sidebarContent, children }: WindowLayoutProps) {
    return (
        <div className="flex h-full font-ubuntu">
            {/* Sidebar */}
            {sidebarContent ? (
                <div className="w-48 bg-[#2C2C2C] border-r border-[#3E3E3E] p-2 flex flex-col gap-1 text-sm">
                    {/* File Tree Mockup */}
                    <div className="px-2 py-1 text-gray-400 text-xs font-bold uppercase tracking-wider">Places</div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#3E3E3E] cursor-pointer text-white">
                        <span className="w-4 h-4 bg-orange-500 rounded-sm"></span> Home
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#3E3E3E] cursor-pointer text-white">
                        <span className="w-4 h-4 bg-blue-400 rounded-sm"></span> Desktop
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#3E3E3E] cursor-pointer text-white">
                        <span className="w-4 h-4 bg-green-400 rounded-sm"></span> Documents
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#3E3E3E] cursor-pointer text-white">
                        <span className="w-4 h-4 bg-purple-400 rounded-sm"></span> Downloads
                    </div>

                    <div className="mt-4 px-2 py-1 text-gray-400 text-xs font-bold uppercase tracking-wider">Context</div>
                    {sidebarContent}
                </div>
            ) : null}

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#1E1E1E]">
                {/* Breadcrumb / Header */}
                <div className="bg-[#2C2C2C] px-4 py-2 text-[#AEA79F] text-sm border-b border-[#3E3E3E] flex items-center">
                    {title}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-auto text-white">
                    {children}
                </div>
            </div>
        </div>
    );
}
