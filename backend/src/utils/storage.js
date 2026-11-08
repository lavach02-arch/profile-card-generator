import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  extractInitials,
  generateSlug,
  parseSkills,
  normalizeSocialLinks,
  calculateProfileStats,
  resolveAvatarUrl,
} from './stringUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, root filesystem is read-only except /tmp
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'profile-cards-data')
  : path.resolve(__dirname, '../../data');

const DB_FILE = path.join(DATA_DIR, 'profiles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Returns initial realistic seed profiles.
 */
export function getSeedProfiles() {
  const seed1 = {
    id: 'prof_seed_001',
    fullName: 'Lava Kumar',
    title: 'Full-Stack Developer & Cloud Architect',
    bio: 'Passionate about crafting resilient microservices, responsive web applications, and automated developer tooling. Active open-source enthusiast and tech mentor.',
    location: 'Hyderabad, India',
    theme: 'aurora',
    badge: 'Pro Developer',
    avatarStyle: 'bottts',
    avatarUrl: resolveAvatarUrl('Lava Kumar', 'bottts'),
    skills: parseSkills('JavaScript, Node.js, Express, React, PostgreSQL, Docker, AWS, Tailwind CSS'),
    socialLinks: normalizeSocialLinks({
      github: 'lavach02-arch',
      linkedin: 'lavach',
      twitter: 'lavach_dev',
      website: 'https://lavach.dev',
      email: 'lavach@example.com',
    }),
    slug: 'lava-kumar-seed',
    createdAt: '2026-11-08T08:00:00.000Z',
    updatedAt: '2026-11-08T08:00:00.000Z',
  };
  seed1.stats = calculateProfileStats(seed1);

  const seed2 = {
    id: 'prof_seed_002',
    fullName: 'Dr. Aisha Patel',
    title: 'AI Research Scientist & Deep Learning Engineer',
    bio: 'Pioneering multimodal neural architectures and trustworthy generative AI. Building intelligent systems at the intersection of neuroscience and deep learning.',
    location: 'Bengaluru, India',
    theme: 'midnight',
    badge: 'AI Specialist',
    avatarStyle: 'lorelei',
    avatarUrl: resolveAvatarUrl('Aisha Patel', 'lorelei'),
    skills: parseSkills('Python, PyTorch, Transformers, LangChain, FastEmbed, CUDA, LLMOps'),
    socialLinks: normalizeSocialLinks({
      github: 'aishapatel-ai',
      linkedin: 'aisha-patel-phd',
      twitter: 'aisha_tensor',
      website: 'https://aishapatel.ai',
    }),
    slug: 'aisha-patel-seed',
    createdAt: '2026-11-08T08:15:00.000Z',
    updatedAt: '2026-11-08T08:15:00.000Z',
  };
  seed2.stats = calculateProfileStats(seed2);

  const seed3 = {
    id: 'prof_seed_003',
    fullName: 'Marcus Vance',
    title: 'Design Systems Lead & Frontend Architect',
    bio: 'Translating design tokens into pixel-perfect components with WCAG AAA accessibility. Believer in clean typography, micro-interactions, and high performance.',
    location: 'San Francisco, CA',
    theme: 'emerald',
    badge: 'Design Lead',
    avatarStyle: 'adventurer',
    avatarUrl: resolveAvatarUrl('Marcus Vance', 'adventurer'),
    skills: parseSkills('Figma, Tailwind CSS, TypeScript, Next.js, Design Tokens, Web Audio'),
    socialLinks: normalizeSocialLinks({
      github: 'marcusvance',
      linkedin: 'marcus-vance-design',
      website: 'https://marcusvance.design',
    }),
    slug: 'marcus-vance-seed',
    createdAt: '2026-11-08T08:30:00.000Z',
    updatedAt: '2026-11-08T08:30:00.000Z',
  };
  seed3.stats = calculateProfileStats(seed3);

  const seed4 = {
    id: 'prof_seed_004',
    fullName: 'Elena Rostova',
    title: 'Distributed Systems & Rust Core Maintainer',
    bio: 'Building low-latency Raft consensus engines and kernel-bypass networking tools. Open-source advocate contributing to compilers and async runtimes.',
    location: 'Berlin, Germany',
    theme: 'sunset',
    badge: 'OSS Maintainer',
    avatarStyle: 'bottts',
    avatarUrl: resolveAvatarUrl('Elena Rostova', 'bottts'),
    skills: parseSkills('Rust, WebAssembly, Go, Distributed Systems, Linux, Tokio, eBPF'),
    socialLinks: normalizeSocialLinks({
      github: 'erostova',
      twitter: 'elena_rust',
      website: 'https://rostova.systems',
    }),
    slug: 'elena-rostova-seed',
    createdAt: '2026-11-08T08:45:00.000Z',
    updatedAt: '2026-11-08T08:45:00.000Z',
  };
  seed4.stats = calculateProfileStats(seed4);

  return [seed1, seed2, seed3, seed4];
}

/**
 * Loads all profiles from disk, seeding if file doesn't exist.
 * @returns {Array<object>}
 */
export function loadProfiles() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seeds = getSeedProfiles();
      saveProfilesToDisk(seeds);
      return seeds;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading profiles, fallback to seeds:', err.message);
    const seeds = getSeedProfiles();
    return seeds;
  }
}

/**
 * Persists profiles array to disk atomically.
 * @param {Array<object>} profiles
 */
export function saveProfilesToDisk(profiles) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save profiles to disk:', err.message);
  }
}

/**
 * Queries profiles with search, filter, and pagination.
 */
export function getAllProfiles({ search = '', skill = '', theme = '', badge = '', limit = 50, offset = 0 } = {}) {
  let list = loadProfiles();

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(p =>
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.bio && p.bio.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.skills && p.skills.some(s => s.name.toLowerCase().includes(q)))
    );
  }

  if (skill) {
    const sTarget = skill.toLowerCase().trim();
    list = list.filter(p =>
      p.skills && p.skills.some(s => s.name.toLowerCase() === sTarget)
    );
  }

  if (theme) {
    list = list.filter(p => p.theme === theme);
  }

  if (badge) {
    list = list.filter(p => p.badge === badge);
  }

  const total = list.length;
  const paginated = list.slice(offset, offset + limit);

  return {
    total,
    count: paginated.length,
    profiles: paginated,
  };
}

/**
 * Retrieves a single profile by ID.
 * @param {string} id
 */
export function getProfileById(id) {
  const list = loadProfiles();
  return list.find(p => p.id === id) || null;
}

/**
 * Retrieves a single profile by unique slug.
 * @param {string} slug
 */
export function getProfileBySlug(slug) {
  const list = loadProfiles();
  return list.find(p => p.slug === slug) || null;
}

/**
 * Creates and saves a new profile record.
 * @param {object} rawInput
 * @returns {object} Processed profile record
 */
export function saveProfile(rawInput) {
  const list = loadProfiles();
  const id = `prof_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const fullName = (rawInput.fullName || '').trim();
  const slug = generateSlug(fullName);
  const skills = parseSkills(rawInput.skills);
  const socialLinks = normalizeSocialLinks(rawInput.socialLinks || {
    github: rawInput.github,
    linkedin: rawInput.linkedin,
    twitter: rawInput.twitter,
    website: rawInput.website,
    email: rawInput.email,
  });

  const avatarStyle = rawInput.avatarStyle || 'bottts';
  const avatarUrl = resolveAvatarUrl(fullName, avatarStyle, rawInput.avatarUrl);

  const profile = {
    id,
    fullName,
    title: (rawInput.title || '').trim(),
    bio: (rawInput.bio || '').trim(),
    location: (rawInput.location || '').trim(),
    theme: rawInput.theme || 'aurora',
    badge: (rawInput.badge || 'Verified Builder').trim(),
    avatarStyle,
    avatarUrl,
    skills,
    socialLinks,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  profile.stats = calculateProfileStats(profile);

  list.unshift(profile);
  saveProfilesToDisk(list);
  return profile;
}

/**
 * Updates an existing profile by ID.
 * @param {string} id
 * @param {object} updates
 * @returns {object|null}
 */
export function updateProfile(id, updates) {
  const list = loadProfiles();
  const index = list.findIndex(p => p.id === id);
  if (index === -1) return null;

  const current = list[index];
  const now = new Date().toISOString();

  const updatedFullName = updates.fullName !== undefined ? updates.fullName.trim() : current.fullName;
  const updatedSkills = updates.skills !== undefined ? parseSkills(updates.skills) : current.skills;

  const updatedSocials = updates.socialLinks !== undefined
    ? normalizeSocialLinks(updates.socialLinks)
    : (updates.github || updates.linkedin || updates.twitter || updates.website || updates.email)
      ? normalizeSocialLinks({
          github: updates.github ?? current.socialLinks?.github?.username,
          linkedin: updates.linkedin ?? current.socialLinks?.linkedin?.username,
          twitter: updates.twitter ?? current.socialLinks?.twitter?.username,
          website: updates.website ?? current.socialLinks?.website?.url,
          email: updates.email ?? current.socialLinks?.email?.username,
        })
      : current.socialLinks;

  const updatedAvatarStyle = updates.avatarStyle || current.avatarStyle;
  const updatedAvatarUrl = resolveAvatarUrl(updatedFullName, updatedAvatarStyle, updates.avatarUrl || current.avatarUrl);

  const merged = {
    ...current,
    ...updates,
    fullName: updatedFullName,
    title: updates.title !== undefined ? updates.title.trim() : current.title,
    bio: updates.bio !== undefined ? updates.bio.trim() : current.bio,
    location: updates.location !== undefined ? updates.location.trim() : current.location,
    theme: updates.theme || current.theme,
    badge: updates.badge !== undefined ? updates.badge.trim() : current.badge,
    avatarStyle: updatedAvatarStyle,
    avatarUrl: updatedAvatarUrl,
    skills: updatedSkills,
    socialLinks: updatedSocials,
    updatedAt: now,
  };

  merged.stats = calculateProfileStats(merged);

  list[index] = merged;
  saveProfilesToDisk(list);
  return merged;
}

/**
 * Deletes a profile by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteProfile(id) {
  const list = loadProfiles();
  const index = list.findIndex(p => p.id === id);
  if (index === -1) return false;

  list.splice(index, 1);
  saveProfilesToDisk(list);
  return true;
}

/**
 * Resets storage back to initial seed data.
 */
export function resetStorage() {
  const seeds = getSeedProfiles();
  saveProfilesToDisk(seeds);
  return seeds;
}
