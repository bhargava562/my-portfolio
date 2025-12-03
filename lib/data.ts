import prisma from './prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const getProfile = async () => {
    const profile = await prisma.profile.findFirst();
    return profile;
};

export const getExperiences = async () => {
    const experiences = await prisma.experience.findMany({
        orderBy: { startDate: 'desc' }
    });
    return experiences;
};

export const getSkills = async () => {
    const skills = await prisma.skill.findMany();
    return skills;
};

export const getSocialLinks = async () => {
    const socialLinks = await prisma.socialLink.findMany();
    return socialLinks;
};

export const getEducations = async () => {
    const educations = await prisma.education.findMany({
        orderBy: { startDate: 'desc' }
    });
    return educations;
};

export const getCertifications = async () => {
    const certifications = await prisma.certification.findMany({
        orderBy: { date: 'desc' }
    });
    return certifications;
};
