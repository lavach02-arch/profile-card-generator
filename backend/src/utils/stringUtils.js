import crypto from 'crypto';

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extracts 1-2 uppercase initials from a full name.
 * e.g., "Lava Kumar" -> "LK", "Ananya" -> "AN", "John Doe Smith" -> "JS"
 * @param {string} name
 * @returns {string}
 */
export function extractInitials(name) {
  if (!name || typeof name !== 'string') return 'DC';
  const clean = name.trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ').filter(Boolean);

  if (parts.length === 0) return 'DC';
  if (parts.length === 1) {
    const single = parts[0];
    return single.length >= 2
      ? single.substring(0, 2).toUpperCase()
      : single.charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generates a clean, URL-safe slug from a user name.
 * e.g., "Lava Kumar" -> "lava-kumar-9f3a"
 * @param {string} name
 * @param {string} [customSuffix]
 * @returns {string}
 */
export function generateSlug(name, customSuffix) {
  const base = (name || 'dev')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'profile';

  const suffix = customSuffix || crypto.randomBytes(2).toString('hex');
  return `${base}-${suffix}`;
}

/**
 * Palette colors for skill badges
 */
const SKILL_COLOR_PALETTES = [
  { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' }, // blue
  { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)' }, // emerald
  { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(192, 132, 252, 0.3)' }, // purple
  { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' }, // amber
  { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(244, 114, 182, 0.3)' }, // pink
  { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' }, // sky
  { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' }, // orange
  { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(129, 140, 248, 0.3)' }, // indigo
];

/**
 * Parses skills string or array into normalized, styled skill items.
 * e.g., "Node.js, Express, React, Tailwind CSS"
 * @param {string|string[]} skillsInput
 * @returns {Array<{ name: string, color: { bg: string, text: string, border: string } }>}
 */
export function parseSkills(skillsInput) {
  if (!skillsInput) return [];

  let rawList = [];
  if (Array.isArray(skillsInput)) {
    rawList = skillsInput;
  } else if (typeof skillsInput === 'string') {
    rawList = skillsInput.split(/[,;\n|]+/);
  }

  const seen = new Set();
  const cleaned = [];

  for (const item of rawList) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const lowerKey = trimmed.toLowerCase();
    if (seen.has(lowerKey)) continue;
    seen.add(lowerKey);

    // Pick deterministic color based on skill name hash
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = (hash << 5) - hash + trimmed.charCodeAt(i);
      hash |= 0;
    }
    const colorIndex = Math.abs(hash) % SKILL_COLOR_PALETTES.length;

    cleaned.push({
      name: trimmed,
      color: SKILL_COLOR_PALETTES[colorIndex],
    });

    if (cleaned.length >= 15) break; // Maximum 15 skills
  }

  return cleaned;
}

/**
 * Normalizes user-submitted social media usernames / links into valid URLs.
 * Handles shorthand handles like "@johndoe", "johndoe", or "github.com/johndoe"
 * @param {Record<string, string>} socials
 * @returns {Record<string, { username: string, url: string, label: string }>}
 */
export function normalizeSocialLinks(socials = {}) {
  const normalized = {};

  // GitHub
  if (socials.github && typeof socials.github === 'string') {
    const raw = socials.github.trim();
    if (raw) {
      let username = raw.replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/+$/, '');
      if (username) {
        normalized.github = {
          username: `@${username}`,
          url: `https://github.com/${username}`,
          label: 'GitHub',
        };
      }
    }
  }

  // LinkedIn
  if (socials.linkedin && typeof socials.linkedin === 'string') {
    const raw = socials.linkedin.trim();
    if (raw) {
      let handle = raw
        .replace(/^https?:\/\/(www\.)?linkedin\.com\//i, '')
        .replace(/^in\//i, '')
        .replace(/^@/, '')
        .replace(/\/+$/, '');
      if (handle) {
        normalized.linkedin = {
          username: `in/${handle}`,
          url: `https://www.linkedin.com/in/${handle}`,
          label: 'LinkedIn',
        };
      }
    }
  }

  // Twitter / X
  if (socials.twitter && typeof socials.twitter === 'string') {
    const raw = socials.twitter.trim();
    if (raw) {
      let handle = raw.replace(/^@/, '').replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '').replace(/\/+$/, '');
      if (handle) {
        normalized.twitter = {
          username: `@${handle}`,
          url: `https://x.com/${handle}`,
          label: 'X (Twitter)',
        };
      }
    }
  }

  // Website / Portfolio
  if (socials.website && typeof socials.website === 'string') {
    let raw = socials.website.trim();
    if (raw) {
      if (!/^https?:\/\//i.test(raw)) {
        raw = `https://${raw}`;
      }
      try {
        const parsed = new URL(raw);
        normalized.website = {
          username: parsed.hostname,
          url: raw,
          label: 'Portfolio',
        };
      } catch {
        // Skip invalid URL
      }
    }
  }

  // Email
  if (socials.email && typeof socials.email === 'string') {
    const raw = socials.email.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      normalized.email = {
        username: raw,
        url: `mailto:${raw}`,
        label: 'Email',
      };
    }
  }

  return normalized;
}

/**
 * Calculates profile analytics and stats.
 * @param {{ bio?: string, skills?: any[], fullName?: string, socialLinks?: any }} profile
 * @returns {{ wordCount: number, charCount: number, readingTimeSeconds: number, completionPercent: number }}
 */
export function calculateProfileStats(profile) {
  const bio = (profile.bio || '').trim();
  const words = bio ? bio.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = bio.length;
  const readingTimeSeconds = Math.max(1, Math.ceil(wordCount / 3.5)); // ~210 wpm

  let score = 0;
  if (profile.fullName && profile.fullName.trim().length >= 2) score += 25;
  if (profile.title && profile.title.trim().length >= 2) score += 20;
  if (bio.length >= 20) score += 20;
  if (profile.skills && profile.skills.length >= 3) score += 20;
  if (profile.socialLinks && Object.keys(profile.socialLinks).length >= 1) score += 15;

  return {
    wordCount,
    charCount,
    readingTimeSeconds,
    completionPercent: Math.min(100, score),
  };
}

/**
 * Generates an avatar URL based on avatarStyle and seed name.
 * Supported styles: 'initials', 'bottts', 'adventurer', 'lorelei', 'identicon', or custom URL.
 * @param {string} name
 * @param {string} [style='bottts']
 * @param {string} [customUrl]
 * @returns {string}
 */
export function resolveAvatarUrl(name, style = 'bottts', customUrl = '') {
  if (customUrl && typeof customUrl === 'string' && /^https?:\/\//i.test(customUrl.trim())) {
    return customUrl.trim();
  }

  const seed = encodeURIComponent((name || 'developer').trim().toLowerCase());

  switch (style) {
    case 'initials':
      return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&radius=50&backgroundColor=6366f1,8b5cf6,ec4899,10b981,3b82f6`;
    case 'adventurer':
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50`;
    case 'lorelei':
      return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&radius=50`;
    case 'identicon':
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&radius=50`;
    case 'bottts':
    default:
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&radius=50`;
  }
}
