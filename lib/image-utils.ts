const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "public";

const INVALID_PATH_STRINGS = ['null', 'undefined', 'sample', 'none', 'empty'];

export function buildSupabaseImageUrl(
  path: string,
  width: number,
  quality = 75
) {
  if (!path) return "";
  
  // Proactive validation: if path matches common "bad data" strings, return empty
  const lowerPath = path.toLowerCase().trim();
  if (INVALID_PATH_STRINGS.includes(lowerPath)) return "";

  if (path.startsWith('http') || path.startsWith('/')) {
    return path; // Return as-is if already a full URL or local path
  }

  if (!STORAGE_URL) {
    console.warn("[image-utils] NEXT_PUBLIC_SUPABASE_STORAGE_URL not set");
    return "";
  }

  // Ensure trailing slash on storage URL
  const baseUrl = STORAGE_URL.endsWith('/') ? STORAGE_URL : `${STORAGE_URL}/`;
  // Remove leading slash from path if present
  const safePath = path.startsWith('/') ? path.substring(1) : path;

  return `${baseUrl}${BUCKET}/${safePath}?width=${width}&quality=${quality}`;
}