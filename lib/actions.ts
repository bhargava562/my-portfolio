// Read static optimized JSON strictly built by Background Sync pipeline via HTTP GET.
// This prevents Next.js from spawning an implicit POST Server Action on window renders.
async function getPortfolioData() {
  try {
    const res = await fetch('/data/portfolio.json', { cache: 'no-store' });
    if (!res.ok) {
      console.error("❌ Failed to read static portfolio JSON: Status", res.status);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Failed to fetch static portfolio JSON:", error);
    return null;
  }
}

export const getProfile = async () => {
    const data = await getPortfolioData();
    return data?.profile || null;
};

export const getSkills = async () => {
    const data = await getPortfolioData();
    return data?.skills || [];
};

export const getExperiences = async () => {
    const data = await getPortfolioData();
    // Pre-sorted by start_date desc via syncPortfolio
    return data?.experience || [];
};

export const getEducation = async () => {
    const data = await getPortfolioData();
    return data?.education || [];
};

export const getCertifications = async () => {
    const data = await getPortfolioData();
    return data?.certifications || [];
};

export const getSocialLinks = async () => {
    const data = await getPortfolioData();
    return data?.social_profiles || [];
};

// Get skills grouped by category dynamically from JSON
interface SkillNode {
  id: number;
  name: string;
  category: string;
  icon: string | null;
  level: number;
  [key: string]: unknown;
}

export const getSkillsByCategory = async () => {
    const data = await getPortfolioData();
    const skills = data?.skills || [];
    const grouped: Record<string, SkillNode[]> = {};

    skills.forEach((skill: SkillNode) => {
        if (!grouped[skill.category]) {
            grouped[skill.category] = [];
        }
        grouped[skill.category].push(skill);
    });

    return grouped;
};

// ============= MOCK/DISABLED UPDATE ACTIONS =============
// Production sync flow architecture dictates ALL updates run strictly through Supabase.
// These are disabled to prevent DB corruption locally since single-source-of-truth is remote!

/* eslint-disable @typescript-eslint/no-unused-vars */
export const updateProfile = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
export const updateSkill = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
export const deleteSkill = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
export const updateExperience = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
export const deleteExperience = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
export const updateSocialLink = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
export const deleteSocialLink = async (...args: unknown[]) => { throw new Error("Disabled. Update directly via Supabase"); };
/* eslint-enable @typescript-eslint/no-unused-vars */
