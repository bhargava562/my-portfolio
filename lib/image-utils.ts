const BASE = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;

export function buildSupabaseImageUrl(
  path: string,
  width: number,
  quality = 75
) {
  if (!path) return "";
  
  if (path.startsWith('http') || path.startsWith('/')) {
      return path; // Return as-is if already a full URL or local path
  }

  // Ensure the URL includes the /public/ segment required by Supabase Storage
  let safeBase = BASE?.endsWith('/') ? BASE : `${BASE}/`;
  if (!safeBase.includes('/public/') && !safeBase.endsWith('/public/')) {
    safeBase += 'public/';
  }
  const safePath = path.startsWith('/') ? path.substring(1) : path;

  return `${safeBase}${safePath}?width=${width}&quality=${quality}`;
}
