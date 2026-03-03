let cachedData: Record<string, unknown> | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds in-memory fallback cache

// Read static optimized JSON strictly built by Background Sync pipeline via HTTP GET.
async function getPortfolioData() {
  const now = Date.now();
  if (cachedData && (now - lastCacheTime < CACHE_TTL)) {
      return cachedData;
  }

  try {
    const res = await fetch('/data/portfolio.json', { cache: 'no-store' });
    if (!res.ok) {
      console.error("❌ Failed to read static portfolio JSON: Status", res.status);
      return cachedData || null;
    }
    const parsed = await res.json();
    cachedData = parsed;
    lastCacheTime = now;
    return parsed;
  } catch (error) {
    console.error("❌ Failed to fetch static portfolio JSON:", error);
    // Graceful fallback during a split-second atomic failure or missing file
    return cachedData || null;
  }
}

export function getImageUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // Format is storage/v1/object/public/[bucket_or_path]
    return `${baseUrl}/storage/v1/object/public/${path}`;
}

export const getProfile = async () => {
    try {
        const data = await getPortfolioData();
        return data?.profile || null;
    } catch { return null; }
};

export const getSkills = async () => {
    try {
        const data = await getPortfolioData();
        return data?.skills || [];
    } catch { return []; }
};

export const getExperiences = async () => {
    try {
        const data = await getPortfolioData();
        return data?.experience || [];
    } catch { return []; }
};

export const getEducation = async () => {
    try {
        const data = await getPortfolioData();
        return data?.education || [];
    } catch { return []; }
};

export const getCertifications = async () => {
    try {
        const data = await getPortfolioData();
        return data?.certifications || [];
    } catch { return []; }
};

export const getProjects = async () => {
    try {
        const data = await getPortfolioData();
        return data?.projects || [];
    } catch { return []; }
};

export const getSocialLinks = async () => {
    try {
        const data = await getPortfolioData();
        return data?.social_profiles || [];
    } catch { return []; }
};

export const getHackathons = async () => {
    try {
        const data = await getPortfolioData();
        return data?.hackathons || [];
    } catch { return []; }
};

export const getAwards = async () => {
    try {
        const data = await getPortfolioData();
        return data?.awards || [];
    } catch { return []; }
};

export const getBlogs = async () => {
    try {
        const data = await getPortfolioData();
        return data?.blogs || [];
    } catch { return []; }
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
    try {
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
    } catch { return {}; }
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
