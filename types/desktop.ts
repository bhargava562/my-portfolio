import { ReactNode } from 'react';

export type DesktopItemType = 'file' | 'folder' | 'app';

export interface DesktopItem {
    id: string;
    title: string;
    type: DesktopItemType;
    icon?: React.ComponentType<{ className?: string }>;
    content?: ReactNode; // For 'file' type (direct open)
    children?: DesktopItem[]; // For 'folder' type
    appUrl?: string; // For 'app' type (e.g., Contact Me)
    metadata?: any; // Extra data like Prisma ID
}

export interface WindowState {
    id: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    type: DesktopItemType;
    content?: ReactNode;
}
