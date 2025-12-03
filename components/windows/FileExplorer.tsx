import React, { useEffect } from 'react';
import { YaruFolderIcon, YaruFileIcon } from '../icons/YaruIcons';
import { DesktopItem } from '@/types/desktop';
import WindowLayout from './WindowLayout';
import { useWindows } from '../WindowManager';
import { ChevronLeft, Home as HomeIcon } from 'lucide-react';
import SidebarTree from './SidebarTree';

interface FileExplorerProps {
    windowId: string;
    rootItems: DesktopItem[];
    initialPath?: string;
    onItemClick?: (item: DesktopItem) => void; // Keep for backward compatibility or file opening
}

export default function FileExplorer({ windowId, rootItems, initialPath = '/', onItemClick }: FileExplorerProps) {
    const { navigateWindow, windows } = useWindows();

    // Get current path from window state
    const currentWindow = windows.find(w => w.id === windowId);
    const currentPath = currentWindow?.currentPath || initialPath;

    // Ensure path is set in state on mount if missing, or if initialPath changes
    useEffect(() => {
        if (initialPath && currentWindow?.currentPath !== initialPath) {
            navigateWindow(windowId, initialPath);
        } else if (currentWindow && !currentWindow.currentPath) {
            navigateWindow(windowId, initialPath);
        }
    }, [windowId, initialPath, currentWindow?.currentPath, navigateWindow]);

    // Helper to resolve items at current path
    const getItemsAtPath = (path: string, root: DesktopItem[]): DesktopItem[] => {
        if (path === '/' || path === '') return root;

        const parts = path.split('/').filter(p => p);
        let currentLevel = root;

        for (const part of parts) {
            const found = currentLevel.find(item => item.id === part);
            if (found && found.children) {
                currentLevel = found.children;
            } else {
                return []; // Path not found
            }
        }
        return currentLevel;
    };

    const items = getItemsAtPath(currentPath, rootItems);

    const handleNavigate = (path: string) => {
        navigateWindow(windowId, path);
    };

    const handleUp = () => {
        if (currentPath === '/') return;
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        const newPath = parts.length === 0 ? '/' : '/' + parts.join('/');
        handleNavigate(newPath);
    };

    const handleItemInteraction = (item: DesktopItem) => {
        if (item.type === 'folder') {
            // Navigate into folder
            const newPath = currentPath === '/' ? `/${item.id}` : `${currentPath}/${item.id}`;
            handleNavigate(newPath);
        } else {
            // Open file (delegate to parent or default open logic)
            if (onItemClick) {
                onItemClick(item);
            }
        }
    };

    // Breadcrumb generation
    const breadcrumbs = currentPath.split('/').filter(p => p).map((part, index, arr) => {
        const path = '/' + arr.slice(0, index + 1).join('/');
        return { label: part.charAt(0).toUpperCase() + part.slice(1), path };
    });

    const sidebar = (
        <div className="flex flex-col gap-1 h-full">
            <div
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${currentPath === '/' ? 'bg-[#E95420] text-white' : 'text-gray-300 hover:bg-white/5'}`}
                onClick={() => handleNavigate('/')}
            >
                <div className="flex items-center gap-2">
                    <HomeIcon size={16} />
                    <span>Home</span>
                </div>
            </div>

            <div className="my-2 border-b border-white/10" />

            <div className="flex-1 overflow-y-auto">
                <SidebarTree
                    items={rootItems}
                    currentPath={currentPath}
                    onNavigate={handleNavigate}
                />
            </div>
        </div>
    );

    return (
        <WindowLayout
            title={
                <div className="flex items-center gap-2">
                    <button onClick={handleUp} disabled={currentPath === '/'} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium">
                        Home {breadcrumbs.map(b => <span key={b.path} className="text-gray-400"> / {b.label}</span>)}
                    </span>
                </div>
            }
            sidebarContent={sidebar}
        >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-6 content-start">
                {items.length > 0 ? items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleItemInteraction(item)}
                        className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/5 group focus:outline-none focus:bg-white/10 transition-colors"
                    >
                        <div className="w-16 h-16">
                            {item.type === 'folder' ? (
                                <YaruFolderIcon className="w-full h-full drop-shadow-lg" />
                            ) : (
                                <YaruFileIcon className="w-full h-full drop-shadow-lg" />
                            )}
                        </div>
                        <span className="text-sm text-[#AEA79F] text-center line-clamp-2 group-hover:text-white transition-colors">
                            {item.title}
                        </span>
                    </button>
                )) : (
                    <div className="col-span-full text-center text-gray-500 mt-10">Folder is empty</div>
                )}
            </div>
        </WindowLayout>
    );
}
