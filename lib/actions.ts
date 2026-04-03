// Session-scoped Promise caches for deduplication (with TTL for freshness)
let portfolioPromise: Promise<Record<string, unknown>> | null = null;
let portfolioCacheTime = 0;
const PORTFOLIO_CACHE_TTL_MS = 60_000; // 60 seconds

let uiConfigPromise: Promise<Record<string, unknown>> | null = null;

// Resilient fetch wrapper with timeout and exponential backoff
async function fetchWithRetry(url: string, retries = 3, timeoutMs = 5000, options: RequestInit = {}): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      clearTimeout(timeoutId);
      if (i === retries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Unreachable");
}

// Read portfolio JSON from Supabase Storage (serverless-safe, no local filesystem).
// The JSON is compiled & uploaded by the Background Sync pipeline (runSync).
// Cache expires after 60s to pick up fresh data after a sync.
export function getPortfolioData(): Promise<Record<string, unknown>> {
  const now = Date.now();

  // Invalidate cache if TTL has expired
  if (portfolioPromise && (now - portfolioCacheTime) > PORTFOLIO_CACHE_TTL_MS) {
    portfolioPromise = null;
  }

  if (!portfolioPromise) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
      return Promise.resolve({});
    }

    const baseUrl = `${supabaseUrl}/storage/v1/object/public/system-cache/portfolio.json`;
    // Cache-bust: append timestamp to bypass CDN/browser caching of stale JSON
    const url = `${baseUrl}?t=${now}`;

    portfolioCacheTime = now;
    // Explicitly bypass browser disk cache completely using native APIs
    portfolioPromise = fetchWithRetry(url, 3, 5000, { cache: 'no-store' })
      .then(res => res.json())
      .catch(error => {
        console.error("❌ Failed to fetch portfolio JSON from Supabase Storage:", error);
        portfolioPromise = null;
        return {};
      });
  }
  return portfolioPromise;
}

// Load presentation rules dynamically
export function getUiConfigData(): Promise<Record<string, unknown>> {
  if (!uiConfigPromise) {
    uiConfigPromise = fetchWithRetry('/data/ui_config.json')
      .then(res => res.json())
      .catch(error => {
        console.error("❌ Failed to fetch ui_config.json:", error);
        uiConfigPromise = null;
        return {};
      });
  }
  return uiConfigPromise;
}

export function getImageUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;

    const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'public';

    if (!storageUrl) {
        console.warn('[actions] NEXT_PUBLIC_SUPABASE_STORAGE_URL not set');
        return '';
    }

    const baseUrl = storageUrl.endsWith('/') ? storageUrl : `${storageUrl}/`;
    const safePath = path.startsWith('/') ? path.substring(1) : path;

    return `${baseUrl}${bucket}/${safePath}`;
}

export interface ImageConfig {
    imageField: string;
    fallback?: string;
}

export const getImageConfig = async (dataset: string): Promise<ImageConfig | null> => {
    try {
        const data = await getPortfolioData();
        return (data?.imageConfig as Record<string, ImageConfig> | undefined)?.[dataset] || null;
    } catch { return null; }
};

export const resolveImagePath = async (dataset: string, record: Record<string, unknown>) => {
    const config = await getImageConfig(dataset);

    // Default fallback if not defined in config
    const defaultFallback = `/${dataset}/default.webp`;
    const fallbackUrl = config?.fallback || defaultFallback;

    if (!config || !record || !record[config.imageField]) {
        return { primaryUrl: null, fallbackUrl };
    }

    const path = record[config.imageField] as string;
    let primaryUrl = null;

    if (path.startsWith('http') || path.startsWith('/')) {
        primaryUrl = path;
    } else {
        const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'public';

        if (storageUrl) {
            const baseUrl = storageUrl.endsWith('/') ? storageUrl : `${storageUrl}/`;
            const safePath = path.startsWith('/') ? path.substring(1) : path;
            primaryUrl = `${baseUrl}${bucket}/${safePath}`;
        }
    }

    return { primaryUrl, fallbackUrl };
};

export const getProfile = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.profile as Record<string, unknown>) || null;
    } catch { return null; }
};

export const getSkills = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.skills as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getExperiences = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.experience as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getEducation = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.education as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getCertifications = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.certifications as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getProjects = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.projects as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getSocialLinks = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.social_profiles as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getHackathons = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.hackathons as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getAwards = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.awards as Record<string, unknown>[]) || [];
    } catch { return []; }
};

export const getBlogs = async () => {
    try {
        const data = await getPortfolioData();
        return (data?.blogs as Record<string, unknown>[]) || [];
    } catch { return []; }
};

/**
 * Dynamic accessor — fetch any section by its portfolio.json key.
 * New tables synced from Supabase are automatically accessible
 * without adding a dedicated getter function.
 */
export const getSection = async (key: string): Promise<Record<string, unknown>[]> => {
    try {
        const data = await getPortfolioData();
        const section = data?.[key];
        if (Array.isArray(section)) return section as Record<string, unknown>[];
        return [];
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
        const skills = (data?.skills as SkillNode[]) || [];
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