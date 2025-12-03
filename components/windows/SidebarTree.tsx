import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { DesktopItem } from '@/types/desktop';

interface SidebarTreeProps {
    items: DesktopItem[];
    currentPath: string;
    onNavigate: (path: string) => void;
    level?: number;
    parentPath?: string;
}

export default function SidebarTree({ items, currentPath, onNavigate, level = 0, parentPath = '' }: SidebarTreeProps) {
    // State to track expanded folders
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Auto-expand ancestors of currentPath
    useEffect(() => {
        if (currentPath.startsWith(parentPath)) {
            // If current path is deeper than parent path, we might need to expand relevant children
            // But actually, we just need to ensure *this* level is expanded if it's a parent of currentPath.
            // The parent component handles its own expansion state.
            // Here we need to expand *our* children if they are in the path.

            const relativePath = currentPath.slice(parentPath.length);
            const parts = relativePath.split('/').filter(p => p);

            if (parts.length > 0) {
                const nextId = parts[0];
                setExpanded(prev => ({ ...prev, [nextId]: true }));
            }
        }
    }, [currentPath, parentPath]);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleItemClick = (item: DesktopItem) => {
        const itemPath = parentPath === '/' ? `/${item.id}` : `${parentPath}/${item.id}`;

        if (item.type === 'folder') {
            onNavigate(itemPath);
            setExpanded(prev => ({ ...prev, [item.id]: true }));
        } else {
            // For files, maybe just navigate to them? Or do nothing in sidebar?
            // Usually sidebar is for folders.
            // But if we want to show files, we can.
            // For now, let's assume sidebar is mainly for navigation.
        }
    };

    return (
        <div className="text-sm select-none">
            {items.map((item) => {
                const itemPath = parentPath === '/' ? `/${item.id}` : `${parentPath}/${item.id}`;
                const isActive = currentPath === itemPath;
                const isExpanded = expanded[item.id];
                const hasChildren = item.children && item.children.length > 0;

                // Only show folders in sidebar? Or everything?
                // Ubuntu Nautilus shows "Home", "Desktop", etc. which are folders.
                // Let's show everything but maybe style files differently.
                // Actually, sidebar usually only shows Folders in tree view.
                if (item.type !== 'folder') return null;

                return (
                    <div key={item.id}>
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors ${isActive ? 'bg-[#E95420] text-white' : 'text-gray-300 hover:bg-white/5'
                                }`}
                            style={{ paddingLeft: `${level * 12 + 8}px` }}
                            onClick={() => handleItemClick(item)}
                        >
                            {hasChildren && (
                                <div
                                    className="p-0.5 hover:bg-white/10 rounded"
                                    onClick={(e) => toggleExpand(item.id, e)}
                                >
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                            )}
                            {!hasChildren && <span className="w-4" />} {/* Spacer */}

                            <Folder size={16} className={isActive ? 'text-white' : 'text-[#E95420]'} />
                            <span className="truncate">{item.title}</span>
                        </div>

                        {hasChildren && isExpanded && (
                            <SidebarTree
                                items={item.children || []}
                                currentPath={currentPath}
                                onNavigate={onNavigate}
                                level={level + 1}
                                parentPath={itemPath}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
