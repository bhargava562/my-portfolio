"use server";

import prisma from './prisma';

export const getProfile = async () => {
    const profile = await prisma.profile.findFirst();
    return profile;
};

export const getSkills = async () => {
    const skills = await prisma.skill.findMany();
    return skills;
};

export const getExperiences = async () => {
    const experiences = await prisma.experience.findMany({
        orderBy: { startDate: 'desc' }
    });
    return experiences;
};
