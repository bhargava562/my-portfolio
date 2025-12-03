import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.skill.deleteMany();
    await prisma.socialLink.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.education.deleteMany();
    await prisma.certification.deleteMany();

    // Seed Profile
    await prisma.profile.create({
        data: {
            name: "Bhargava A",
            title: "Java Full Stack Developer | Aspiring AI & Platform Engineer",
            bio: "I'm a Java developer fascinated by the 'how' behind artificial intelligence. While many are building AI models in Python, my passion lies in engineering the robust, enterprise-grade platforms that make them scalable. I'm currently exploring how to connect Java Spring Boot microservices to Generative AI agents and deploy them efficiently using platform engineering principles (like Kubernetes and Docker). I document my learning journey here as I build projects that live at the intersection of Java and AI.",
            email: "bhargavaanand2006@gmail.com",
            phone: "8248724651",
            avatarUrl: "https://github.com/shadcn.png", // Placeholder or actual if available
        }
    });

    // Seed Social Links
    await prisma.socialLink.createMany({
        data: [
            { platformName: "LinkedIn", url: "https://linkedin.com/in/bhargavaa1", iconKey: "linkedin" },
        ],
    });

    // Seed Experience
    await prisma.experience.createMany({
        data: [
            {
                company: "Infosys Springboard",
                role: "Junior Java Developer",
                startDate: new Date("2025-11-01"), // Nov 2025
                description: "Developed Java applications.",
                type: "Internship"
            },
            {
                company: "TEN: Brain Research",
                role: "React Developer",
                startDate: new Date("2025-06-01"),
                endDate: new Date("2025-07-31"),
                description: "Contributed to front-end UI of TEN Tech Competition Engine using React JS.",
                type: "Internship"
            }
        ]
    });

    // Seed Education
    await prisma.education.createMany({
        data: [
            {
                institution: "R.M.K Engineering College",
                degree: "B.Tech CSBS",
                startDate: new Date("2024-01-01"), // 2024
                endDate: new Date("2028-01-01"), // 2028
                description: "Computer Science and Business Systems"
            },
            {
                institution: "Jaya Matric Hr sec school",
                degree: "HSC Computer Science",
                startDate: new Date("2022-01-01"), // Approx
                endDate: new Date("2024-01-01"), // Approx
                description: "Computer Science Stream"
            }
        ]
    });

    // Seed Certifications
    await prisma.certification.createMany({
        data: [
            { name: "Project Management with JIRA", issuer: "Atlassian", date: new Date() },
            { name: "Adobe India Hackathon 2025 (Round 1)", issuer: "Adobe", date: new Date() },
            { name: "HackerRank Certified SQL Basics", issuer: "HackerRank", date: new Date() },
            { name: "Gemini for University Students", issuer: "Google", date: new Date() },
        ]
    });

    // Seed Skills
    await prisma.skill.createMany({
        data: [
            { name: "Java", category: "Languages" },
            { name: "Google Gemini", category: "AI" },
            { name: "Problem Solving", category: "Soft Skills" },
            { name: "React JS", category: "Frameworks" },
            { name: "Spring Boot", category: "Frameworks" },
        ],
    });

    console.log('Seed data inserted successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
