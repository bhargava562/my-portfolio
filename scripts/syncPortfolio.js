/* eslint-disable */
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ CRITICAL: Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const JSON_FILE = path.join(DATA_DIR, 'portfolio.json');
const MIN_JSON_FILE = path.join(DATA_DIR, 'portfolio.min.json');
const TMP_FILE = path.join(DATA_DIR, 'portfolio.json.tmp');
const HASH_FILE = path.join(DATA_DIR, 'portfolio.hash');

async function ensureDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

function cleanData(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanData).filter(val => val !== null && val !== undefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (key !== 'updated_at' && obj[key] !== null && obj[key] !== undefined) {
        acc[key] = cleanData(obj[key]);
      }
      return acc;
    }, {});
  }
  return obj;
}

async function fetchTable(tableName, orderBy = 'id', ascending = true) {
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

  return cleanProjects.map(p => ({
    ...p,
    collaborators: cleanCollabs.filter(c => c.project_id === p.id)
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

async function sync() {
  try {
    console.log("🚀 Starting Supabase Portfolio Sync...");
    await ensureDir();

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

    function sortObject(obj) {
      if (Array.isArray(obj)) return obj.map(sortObject);
      if (obj !== null && typeof obj === 'object') {
        const sorted = {};
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
    } catch (e) { /* File might not exist */ }

    if (oldHash === newHash) {
      console.log("✅ Data unchanged. Skipping file writes.");
      process.exit(0);
    }

    console.log(`🔄 Changes detected... Writing payload explicitly to disk ([${newHash}])...`);
    await fs.writeFile(TMP_FILE, jsonString, 'utf8');
    
    await fs.rename(TMP_FILE, JSON_FILE);
    await fs.writeFile(MIN_JSON_FILE, minifiedString, 'utf8');
    await fs.writeFile(HASH_FILE, newHash, 'utf8');

    console.log("🎉 Sync successful and locked gracefully. Exiting.");
    process.exit(0);

  } catch (err) {
    console.error("💥 FAILED TO SYNC:", err.message || err);
    process.exit(1);
  }
}

sync();
