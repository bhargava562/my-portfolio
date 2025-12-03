import React from 'react';
import WindowLayout from './WindowLayout';

interface DetailViewProps {
    item: any; // Replace with specific type
}

export default function DetailView({ item }: DetailViewProps) {
    const sidebar = (
        <>
            <div className="px-3 py-2 bg-[#E95420] text-white rounded cursor-default">Details</div>
            <div className="px-3 py-2 text-[#AEA79F] hover:bg-white/5 rounded cursor-pointer transition-colors">Properties</div>
        </>
    );

    return (
        <WindowLayout title={item.title} sidebarContent={sidebar}>
            <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold text-white mb-4">{item.title}</h1>
                <div className="text-[#AEA79F]">
                    {item.description || "No description available."}
                </div>
                {/* Render other fields dynamically if available */}
                {item.content && <div className="mt-4">{item.content}</div>}
            </div>
        </WindowLayout>
    );
}
