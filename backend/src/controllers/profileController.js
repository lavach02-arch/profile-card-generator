import {
  getAllProfiles,
  getProfileById,
  getProfileBySlug,
  saveProfile,
  updateProfile,
  deleteProfile,
} from '../utils/storage.js';
import {
  parseSkills,
  normalizeSocialLinks,
  calculateProfileStats,
  resolveAvatarUrl,
  generateSlug,
} from '../utils/stringUtils.js';
import {
  renderHtmlCard,
  renderStandalonePage,
  renderSvgBadge,
  getCardStyles,
  THEMES,
} from '../utils/cardRenderer.js';

/**
 * Validates input payload for profile creation/update.
 * @param {object} body
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateProfileInput(body = {}) {
  const errors = {};

  // Full Name validation
  if (!body.fullName || typeof body.fullName !== 'string' || body.fullName.trim().length < 2) {
    errors.fullName = 'Full Name is required and must be at least 2 characters.';
  } else if (body.fullName.trim().length > 70) {
    errors.fullName = 'Full Name cannot exceed 70 characters.';
  }

  // Title / Headline validation
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 2) {
    errors.title = 'Professional Title is required and must be at least 2 characters.';
  } else if (body.title.trim().length > 90) {
    errors.title = 'Professional Title cannot exceed 90 characters.';
  }

  // Bio length validation
  if (body.bio && typeof body.bio === 'string' && body.bio.length > 1200) {
    errors.bio = 'Bio cannot exceed 1200 characters.';
  }

  // Theme validation
  if (body.theme && !THEMES[body.theme]) {
    errors.theme = `Theme must be one of: ${Object.keys(THEMES).join(', ')}`;
  }

  // Email format validation (if provided)
  if (body.email && typeof body.email === 'string' && body.email.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Real-time dynamic preview generator without saving to database.
 * POST /api/profiles/preview
 */
export function previewProfileCard(req, res) {
  try {
    const raw = req.body || {};
    const validation = validateProfileInput(raw);

    // Build temporary ephemeral profile representation
    const fullName = (raw.fullName || 'Sample Developer').trim();
    const tempProfile = {
      id: 'preview',
      fullName,
      title: (raw.title || 'Full-Stack Developer').trim(),
      bio: (raw.bio || 'Building modern digital products and learning every day.').trim(),
      location: (raw.location || 'Global').trim(),
      theme: raw.theme || 'aurora',
      badge: (raw.badge || 'Verified Builder').trim(),
      avatarStyle: raw.avatarStyle || 'bottts',
      avatarUrl: resolveAvatarUrl(fullName, raw.avatarStyle || 'bottts', raw.avatarUrl),
      skills: parseSkills(raw.skills || 'JavaScript, Node.js, React, Tailwind CSS'),
      socialLinks: normalizeSocialLinks(raw.socialLinks || {
        github: raw.github,
        linkedin: raw.linkedin,
        twitter: raw.twitter,
        website: raw.website,
        email: raw.email,
      }),
      slug: generateSlug(fullName, 'preview'),
    };

    tempProfile.stats = calculateProfileStats(tempProfile);
    const htmlCard = renderHtmlCard(tempProfile);

    return res.status(200).json({
      success: true,
      isValid: validation.isValid,
      errors: validation.errors,
      profile: tempProfile,
      htmlCard,
    });
  } catch (err) {
    console.error('Error generating preview:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate dynamic profile preview',
      error: err.message,
    });
  }
}

/**
 * Creates and stores a new profile card.
 * POST /api/profiles
 */
export function createProfile(req, res) {
  try {
    const raw = req.body || {};
    const validation = validateProfileInput(raw);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed for profile input',
        errors: validation.errors,
      });
    }

    const profile = saveProfile(raw);
    const htmlCard = renderHtmlCard(profile);

    return res.status(201).json({
      success: true,
      message: 'Profile card generated and stored successfully',
      profile,
      htmlCard,
    });
  } catch (err) {
    console.error('Error creating profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating profile card',
      error: err.message,
    });
  }
}

/**
 * Lists all profiles with search, filter, and pagination.
 * GET /api/profiles
 */
export function listProfiles(req, res) {
  try {
    const { search, skill, theme, badge, limit, offset } = req.query;
    const parsedLimit = limit ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : 50;
    const parsedOffset = offset ? Math.max(0, parseInt(offset, 10) || 0) : 0;

    const result = getAllProfiles({
      search,
      skill,
      theme,
      badge,
      limit: parsedLimit,
      offset: parsedOffset,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Error listing profiles:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile directory',
      error: err.message,
    });
  }
}

/**
 * Retrieves a single profile by ID.
 * GET /api/profiles/:id
 */
export function getProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = getProfileById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Profile with ID '${id}' not found`,
      });
    }

    const htmlCard = renderHtmlCard(profile);

    return res.status(200).json({
      success: true,
      profile,
      htmlCard,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: err.message,
    });
  }
}

/**
 * Retrieves a single profile by slug.
 * GET /api/profiles/slug/:slug
 */
export function getProfileBySlugHandler(req, res) {
  try {
    const { slug } = req.params;
    const profile = getProfileBySlug(slug);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Profile with slug '${slug}' not found`,
      });
    }

    const htmlCard = renderHtmlCard(profile);

    return res.status(200).json({
      success: true,
      profile,
      htmlCard,
    });
  } catch (err) {
    console.error('Error fetching profile by slug:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: err.message,
    });
  }
}

/**
 * Updates an existing profile.
 * PUT /api/profiles/:id
 */
export function updateProfileHandler(req, res) {
  try {
    const { id } = req.params;
    const existing = getProfileById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Profile with ID '${id}' not found`,
      });
    }

    const raw = req.body || {};
    // If fullName is provided, validate it
    if (raw.fullName !== undefined) {
      const validation = validateProfileInput({
        ...existing,
        ...raw,
      });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed for update',
          errors: validation.errors,
        });
      }
    }

    const updated = updateProfile(id, raw);
    const htmlCard = renderHtmlCard(updated);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated,
      htmlCard,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: err.message,
    });
  }
}

/**
 * Deletes a profile.
 * DELETE /api/profiles/:id
 */
export function deleteProfileHandler(req, res) {
  try {
    const { id } = req.params;
    const deleted = deleteProfile(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Profile with ID '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile card deleted successfully',
      deletedId: id,
    });
  } catch (err) {
    console.error('Error deleting profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete profile',
      error: err.message,
    });
  }
}

/**
 * Serves a full standalone HTML page for viewing or sharing.
 * GET /cards/:id
 */
export function renderCardPage(req, res) {
  try {
    const { id } = req.params;
    // Allow lookup by ID or slug
    let profile = getProfileById(id) || getProfileBySlug(id);

    if (!profile) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Profile Not Found</title></head>
        <body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <h1>404 - Profile Card Not Found</h1>
            <p>The profile you requested does not exist or has been removed.</p>
            <a href="/" style="color:#38bdf8;">Return to DevCard Studio</a>
          </div>
        </body>
        </html>
      `);
    }

    const fullPageHtml = renderStandalonePage(profile);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fullPageHtml);
  } catch (err) {
    console.error('Error rendering card page:', err);
    return res.status(500).send('Error rendering profile page');
  }
}

/**
 * Serves an embeddable HTML snippet for iframes.
 * GET /cards/:id/embed
 */
export function renderCardEmbed(req, res) {
  try {
    const { id } = req.params;
    const profile = getProfileById(id) || getProfileBySlug(id);

    if (!profile) {
      return res.status(404).send('<!-- Profile Not Found -->');
    }

    const cardMarkup = renderHtmlCard(profile);
    const styles = getCardStyles();

    const embedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 12px; background: transparent; display: flex; justify-content: center; align-items: center; }
          ${styles}
        </style>
      </head>
      <body>
        ${cardMarkup}
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(embedHtml);
  } catch (err) {
    console.error('Error rendering embed:', err);
    return res.status(500).send('Error rendering card embed');
  }
}

/**
 * Serves an SVG card/badge for GitHub READMEs.
 * GET /cards/:id/svg
 */
export function renderCardSvg(req, res) {
  try {
    const { id } = req.params;
    const profile = getProfileById(id) || getProfileBySlug(id);

    if (!profile) {
      return res.status(404).send('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><text x="20" y="45" fill="red">Profile Not Found</text></svg>');
    }

    const svg = renderSvgBadge(profile);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(svg);
  } catch (err) {
    console.error('Error rendering SVG badge:', err);
    return res.status(500).send('<svg xmlns="http://www.w3.org/2000/svg"><text y="20">Error rendering SVG</text></svg>');
  }
}
