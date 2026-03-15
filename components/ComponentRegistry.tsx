import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic Imports
const GenericSectionContent = dynamic(() => import('./windows/GenericSectionContent'), { loading: () => <div>Loading...</div> });
const TextEditor = dynamic(() => import('./windows/TextEditor'), { loading: () => <div>Loading...</div> });
const AboutContent = dynamic(() => import('./windows/AboutContent'), { loading: () => <div>Loading...</div> });
const ContactForm = dynamic(() => import('@/components/windows/ContactForm'), { loading: () => <div>Loading...</div> });
const SkillsContent = dynamic(() => import('./windows/SkillsContent'), { loading: () => <div>Loading...</div> });
const ExperienceContent = dynamic(() => import('./windows/ExperienceContent'), { loading: () => <div>Loading...</div> });
const EducationContent = dynamic(() => import('./windows/EducationContent'), { loading: () => <div>Loading...</div> });
const CertificationsContent = dynamic(() => import('./windows/CertificationsContent'), { loading: () => <div>Loading...</div> });
const ProjectsContent = dynamic(() => import('./windows/ProjectsContent'), { loading: () => <div>Loading...</div> });
const SocialsContent = dynamic(() => import('./windows/SocialsContent'), { loading: () => <div>Loading...</div> });
const HackathonsContent = dynamic(() => import('./windows/HackathonsContent'), { loading: () => <div>Loading...</div> });
const AwardsContent = dynamic(() => import('./windows/AwardsContent'), { loading: () => <div>Loading...</div> });
const BlogsContent = dynamic(() => import('./windows/BlogsContent'), { loading: () => <div>Loading...</div> });
const TerminalContent = dynamic(() => import('./windows/TerminalContent'), { loading: () => <div>Loading...</div> });

export const COMPONENT_REGISTRY: Record<string, React.ElementType> = {
    'about': AboutContent,
    'contact': ContactForm,
    'skills': SkillsContent,
    'experience': ExperienceContent,
    'education': EducationContent,
    'certifications': CertificationsContent,
    'projects': ProjectsContent,
    'socials': SocialsContent,
    'hackathons': HackathonsContent,
    'awards': AwardsContent,
    'blogs': BlogsContent,
    'resume': TextEditor,
    'terminal': TerminalContent,
};

export const getComponent = (id: string): React.ElementType => {
    return COMPONENT_REGISTRY[id] || GenericSectionContent;
};
