import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic Imports
const FileExplorer = dynamic(() => import('./windows/FileExplorer'), { loading: () => <div>Loading...</div> });
const TextEditor = dynamic(() => import('./windows/TextEditor'), { loading: () => <div>Loading...</div> });
const Browser = dynamic(() => import('./windows/Browser'), { loading: () => <div>Loading...</div> });
const DetailView = dynamic(() => import('./windows/DetailView'), { loading: () => <div>Loading...</div> });
const AboutContent = dynamic(() => import('./windows/AboutContent'), { loading: () => <div>Loading...</div> });
const ContactForm = dynamic(() => import('@/components/windows/ContactForm'), { loading: () => <div>Loading...</div> });
const SkillsContent = dynamic(() => import('./windows/SkillsContent'), { loading: () => <div>Loading...</div> });

export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
    'about': AboutContent,
    'contact': ContactForm,
    'skills': SkillsContent,
    'projects': FileExplorer, // Projects is a folder, so it opens FileExplorer
    'experience': FileExplorer, // Experience is a folder
    'socials': FileExplorer,
    'resume': TextEditor,
    // Add other mappings as needed
};

export const getComponent = (id: string) => {
    const Component = COMPONENT_REGISTRY[id];
    if (!Component) {
        // Fallback logic or error
        // For generic files/folders that don't have a specific component override:
        return null;
    }
    return Component;
};
