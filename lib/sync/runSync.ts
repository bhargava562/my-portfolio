import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export async function runSync(): Promise<void> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL: Missing Supabase credentials in .env");
    throw new Error("Missing Supabase credentials");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const DATA_DIR = path.join(process.cwd(), 'public', 'data');
  const JSON_FILE = path.join(DATA_DIR, 'portfolio.json');
  const MIN_JSON_FILE = path.join(DATA_DIR, 'portfolio.min.json');
  const TMP_FILE = path.join(DATA_DIR, 'portfolio.json.tmp');
  const HASH_FILE = path.join(DATA_DIR, 'portfolio.hash');
  const LOCK_FILE = path.join(DATA_DIR, 'portfolio.lock');
    
  try {
    const lockStats = await fs.stat(LOCK_FILE);
    const now = Date.now();
    // 5 minutes timeout for stale locks
    if (now - lockStats.mtimeMs < 5 * 60 * 1000) {
        console.log("Sync already running, skipping...");
        return;
    } else {
        console.log("Stale lock found, removing...");
        await fs.unlink(LOCK_FILE).catch(() => {});
    }
  } catch {
      // Lock doesn't exist
  }

  try {
      await fs.access(DATA_DIR);
  } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
      await fs.writeFile(LOCK_FILE, 'locked');
  } catch (err) {
      console.error("Failed to acquire lock:", err);
      return;
  }

  try {
      console.log("🚀 Starting Supabase Portfolio Sync...");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function cleanData(obj: any): any {
        if (Array.isArray(obj)) {
          return obj.map(cleanData).filter(val => val !== null && val !== undefined);
        } else if (obj !== null && typeof obj === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return Object.keys(obj).reduce((acc: any, key: string) => {
            if (key !== 'updated_at' && obj[key] !== null && obj[key] !== undefined) {
              acc[key] = cleanData(obj[key]);
            }
            return acc;
          }, {});
        }
        return obj;
      }

      async function fetchTable(tableName: string, orderBy = 'id', ascending = true) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order(orderBy, { ascending });
          
        if (error) {
          console.error(`❌ Failed to fetch ${tableName}: ${error.message}`);
          throw error;
        }
        return cleanData(data);
      }

      async function fetchProjects() {
        const { data: projects, error: projErr } = await supabase
          .from('projects')
          .select('*')
          .order('start_date', { ascending: false });

        if (projErr) {
          console.error(`❌ Failed to fetch projects: ${projErr.message}`);
          throw projErr;
        }

        const { data: collabs, error: colErr } = await supabase
          .from('project_collaborators')
          .select('*')
          .order('id', { ascending: true });
          
        if (colErr) {
          console.error(`❌ Failed to fetch collabs: ${colErr.message}`);
          throw colErr;
        }

        const cleanProjects = cleanData(projects);
        const cleanCollabs = cleanData(collabs);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cleanProjects.map((p: any) => ({
          ...p,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collaborators: cleanCollabs.filter((c: any) => c.project_id === p.id)
        }));
      }

      async function fetchBlogs() {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, slug, excerpt, cover_image_path, published_at, reading_time, created_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) {
          console.error(`❌ Failed to fetch blogs: ${error.message}`);
          throw error;
        }
        return cleanData(data);
      }

      const [
        profileResult, skillsResult, socialsResult, educationResult,
        experienceResult, projectsResult, hackathonsResult,
        certificationsResult, awardsResult, blogsResult
      ] = await Promise.all([
        fetchTable('profile', 'id', true),
        fetchTable('skills', 'display_order', true),
        fetchTable('social_profiles', 'display_order', true),
        fetchTable('education', 'display_order', true),
        fetchTable('experience', 'display_order', true),
        fetchProjects(),
        fetchTable('hackathons', 'event_start_date', false),
        fetchTable('certifications', 'issue_date', false),
        fetchTable('awards', 'award_date', false),
        fetchBlogs()
      ]);

      const profile = profileResult[0] || {};
      const payload = {
        profile, 
        skills: skillsResult, 
        social_profiles: socialsResult, 
        education: educationResult,
        experience: experienceResult, 
        projects: projectsResult, 
        hackathons: hackathonsResult, 
        certifications: certificationsResult,
        awards: awardsResult, 
        blogs: blogsResult
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function sortObject(obj: any): any {
        if (Array.isArray(obj)) return obj.map(sortObject);
        if (obj !== null && typeof obj === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sorted: any = {};
          Object.keys(obj).sort().forEach(key => {
            sorted[key] = sortObject(obj[key]);
          });
          return sorted;
        }
        return obj;
      }
      
      const sortedPayload = sortObject(payload);
      const minifiedString = JSON.stringify(sortedPayload);
      const jsonString = JSON.stringify(sortedPayload, null, 2);
      const newHash = crypto.createHash('sha256').update(minifiedString).digest('hex');
      
      let oldHash = null;
      try {
        oldHash = await fs.readFile(HASH_FILE, 'utf8');
      } catch { /* File might not exist */ }

      if (oldHash === newHash) {
        console.log("✅ Data unchanged. Skipping file writes.");
        return;
      }

      console.log(`🔄 Changes detected... Writing payload explicitly to disk ([${newHash}])...`);
      
      // Atomic write pattern
      await fs.writeFile(TMP_FILE, jsonString, 'utf8');
      await fs.rename(TMP_FILE, JSON_FILE);
      
      const TMP_MIN_FILE = path.join(DATA_DIR, 'portfolio.min.json.tmp');
      await fs.writeFile(TMP_MIN_FILE, minifiedString, 'utf8');
      await fs.rename(TMP_MIN_FILE, MIN_JSON_FILE);

      await fs.writeFile(HASH_FILE, newHash, 'utf8');
      console.log("🎉 Sync successful and locked gracefully.");
  } catch (err) {
      console.error("💥 FAILED TO SYNC:", err);
      throw err;
  } finally {
      await fs.unlink(LOCK_FILE).catch(() => {});
  }
}
