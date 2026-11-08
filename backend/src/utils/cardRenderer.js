import { sanitizeHtml, extractInitials } from './stringUtils.js';

/**
 * Theme definitions with CSS gradient styles, text colors, and border accents.
 */
export const THEMES = {
  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    cardBg: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    headerBg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    textColor: '#f8fafc',
    subtitleColor: '#cbd5e1',
    bioColor: '#94a3b8',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    accentGradient: 'linear-gradient(135deg, #6366f1, #ec4899)',
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    badgeText: '#e9d5ff',
    badgeBorder: 'rgba(216, 180, 254, 0.4)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Cyberpunk',
    cardBg: 'linear-gradient(145deg, #090d16 0%, #0d1527 50%, #061e29 100%)',
    headerBg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #10b981 100%)',
    textColor: '#f0fdf4',
    subtitleColor: '#67e8f9',
    bioColor: '#94a3b8',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    accentGradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    badgeText: '#a5f3fc',
    badgeBorder: 'rgba(103, 232, 249, 0.4)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Nature',
    cardBg: 'linear-gradient(145deg, #062016 0%, #0a2e20 50%, #133e2b 100%)',
    headerBg: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    textColor: '#ecfdf5',
    subtitleColor: '#6ee7b7',
    bioColor: '#a7f3d0',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    accentGradient: 'linear-gradient(135deg, #10b981, #34d399)',
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    badgeText: '#a7f3d0',
    badgeBorder: 'rgba(110, 231, 183, 0.4)',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Gold',
    cardBg: 'linear-gradient(145deg, #1f1105 0%, #2e160a 50%, #3a1515 100%)',
    headerBg: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
    textColor: '#fffbeb',
    subtitleColor: '#fdba74',
    bioColor: '#fed7aa',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    accentGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    badgeBg: 'rgba(249, 115, 22, 0.25)',
    badgeText: '#fed7aa',
    badgeBorder: 'rgba(253, 186, 116, 0.4)',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Mono',
    cardBg: 'linear-gradient(145deg, #18181b 0%, #27272a 100%)',
    headerBg: 'linear-gradient(135deg, #52525b 0%, #71717a 100%)',
    textColor: '#fafafa',
    subtitleColor: '#e4e4e7',
    bioColor: '#a1a1aa',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    glowColor: 'rgba(255, 255, 255, 0.1)',
    accentGradient: 'linear-gradient(135deg, #e4e4e7, #a1a1aa)',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    badgeText: '#f4f4f5',
    badgeBorder: 'rgba(255, 255, 255, 0.25)',
  },
};

/**
 * Returns safe SVG icon markup for common social networks.
 */
function getSocialIconSvg(platform) {
  switch (platform) {
    case 'github':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`;
    case 'linkedin':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
    case 'twitter':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
    case 'website':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    case 'email':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
  }
}

/**
 * Renders a dynamic HTML profile card component string.
 * @param {object} profile
 * @param {object} [options]
 * @returns {string} Dynamic HTML Card Markup
 */
export function renderHtmlCard(profile, options = {}) {
  const theme = THEMES[profile.theme] || THEMES.aurora;
  const fullName = sanitizeHtml(profile.fullName || 'Anonymous Developer');
  const title = sanitizeHtml(profile.title || 'Software Craftsman');
  const location = sanitizeHtml(profile.location || '');
  const bio = sanitizeHtml(profile.bio || '').replace(/\n/g, '<br/>');
  const badge = sanitizeHtml(profile.badge || 'Verified Builder');
  const initials = extractInitials(profile.fullName);
  const avatarUrl = profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`;
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const socials = profile.socialLinks || {};
  const stats = profile.stats || {};
  const cardId = profile.id || 'preview';

  // Build skills pills HTML
  const skillsHtml = skills.length > 0
    ? skills.map(s => {
        const name = sanitizeHtml(s.name || s);
        const bg = s.color?.bg || 'rgba(255, 255, 255, 0.1)';
        const text = s.color?.text || '#ffffff';
        const border = s.color?.border || 'rgba(255, 255, 255, 0.2)';
        return `<span class="devcard-skill-tag" style="background:${bg};color:${text};border:1px solid ${border};">${name}</span>`;
      }).join('')
    : '<span class="devcard-no-skills">No skills listed yet</span>';

  // Build social buttons HTML
  const socialEntries = Object.entries(socials);
  const socialsHtml = socialEntries.length > 0
    ? socialEntries.map(([platform, item]) => {
        const url = sanitizeHtml(item.url || '#');
        const label = sanitizeHtml(item.label || platform);
        const username = sanitizeHtml(item.username || '');
        const iconSvg = getSocialIconSvg(platform);
        return `
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="devcard-social-btn" title="${label}: ${username}" aria-label="${label}">
            ${iconSvg}
            <span class="devcard-social-label">${label}</span>
          </a>
        `;
      }).join('')
    : '<span class="devcard-no-socials">No social links added</span>';

  // Location item HTML
  const locationHtml = location
    ? `<div class="devcard-location">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>${location}</span>
      </div>`
    : '';

  return `
<!-- DevCard Generated Profile Card [ID: ${cardId}] -->
<div class="devcard-container" id="devcard-${cardId}" data-theme="${theme.id}" style="--devcard-bg:${theme.cardBg};--devcard-header:${theme.headerBg};--devcard-text:${theme.textColor};--devcard-sub:${theme.subtitleColor};--devcard-bio:${theme.bioColor};--devcard-border:${theme.borderColor};--devcard-glow:${theme.glowColor};--devcard-badge-bg:${theme.badgeBg};--devcard-badge-text:${theme.badgeText};--devcard-badge-border:${theme.badgeBorder};">
  <div class="devcard-inner">
    <!-- Header Cover Banner -->
    <div class="devcard-banner">
      <div class="devcard-banner-pattern"></div>
      <div class="devcard-badge-pill">${badge}</div>
    </div>

    <!-- Avatar & Main Identification -->
    <div class="devcard-header">
      <div class="devcard-avatar-wrapper">
        <img class="devcard-avatar-img" src="${avatarUrl}" alt="${fullName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" loading="lazy" />
        <div class="devcard-avatar-fallback" style="display:none;">${initials}</div>
        <span class="devcard-status-dot" title="Active Developer"></span>
      </div>
      <div class="devcard-name-group">
        <div class="devcard-title-row">
          <h2 class="devcard-name">${fullName}</h2>
          <svg class="devcard-verified-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" title="Verified DevCard"><path d="M12 2l3.09 3.1 4.38-.6 1.34 4.2 3.82 2.3-1.63 4.1 1.63 4.1-3.82 2.3-1.34 4.2-4.38-.6L12 22l-3.09-3.1-4.38.6-1.34-4.2-3.82-2.3 1.63-4.1-1.63-4.1 3.82-2.3 1.34-4.2 4.38.6z"></path><path d="m9 12 2 2 4-4"></path></svg>
        </div>
        <p class="devcard-headline">${title}</p>
        ${locationHtml}
      </div>
    </div>

    <!-- Biography -->
    <div class="devcard-body">
      <div class="devcard-bio">${bio}</div>
    </div>

    <!-- Skills Cloud -->
    <div class="devcard-skills-section">
      <div class="devcard-section-label">Core Competencies & Stack</div>
      <div class="devcard-skills-grid">
        ${skillsHtml}
      </div>
    </div>

    <!-- Social Links Grid -->
    <div class="devcard-social-section">
      <div class="devcard-section-label">Connect & Collaborate</div>
      <div class="devcard-social-links">
        ${socialsHtml}
      </div>
    </div>

    <!-- Card Metadata & Stats Footer -->
    <div class="devcard-footer">
      <div class="devcard-stat-pill" title="Profile Completeness">
        <span class="devcard-stat-number">${stats.completionPercent || 100}%</span> Complete
      </div>
      <div class="devcard-stat-pill" title="Skills Count">
        <span class="devcard-stat-number">${skills.length}</span> Skills
      </div>
      <div class="devcard-footer-branding">
        <span>Powered by <strong>DevCard Studio</strong></span>
      </div>
    </div>
  </div>
</div>
`;
}

/**
 * Returns embedded CSS styles for the rendered dynamic cards.
 */
export function getCardStyles() {
  return `
    :root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .devcard-container {
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
      border-radius: 20px;
      background: var(--devcard-bg);
      border: 1px solid var(--devcard-border);
      box-shadow: 0 20px 40px -15px var(--devcard-glow), 0 0 1px 1px rgba(255, 255, 255, 0.05);
      color: var(--devcard-text);
      overflow: hidden;
      position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      box-sizing: border-box;
    }
    .devcard-container * {
      box-sizing: border-box;
    }
    .devcard-container:hover {
      transform: translateY(-3px);
      box-shadow: 0 25px 50px -12px var(--devcard-glow);
    }
    .devcard-inner {
      position: relative;
      z-index: 2;
    }
    .devcard-banner {
      height: 110px;
      background: var(--devcard-header);
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 14px 18px;
    }
    .devcard-banner-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.2;
      background-image: radial-gradient(#fff 1px, transparent 1px);
      background-size: 14px 14px;
    }
    .devcard-badge-pill {
      position: relative;
      z-index: 3;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      background: var(--devcard-badge-bg);
      color: var(--devcard-badge-text);
      border: 1px solid var(--devcard-badge-border);
      backdrop-filter: blur(8px);
    }
    .devcard-header {
      padding: 0 24px;
      margin-top: -46px;
      display: flex;
      align-items: flex-end;
      gap: 16px;
    }
    .devcard-avatar-wrapper {
      position: relative;
      width: 86px;
      height: 86px;
      border-radius: 50%;
      border: 4px solid #0f172a;
      background: #1e293b;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      flex-shrink: 0;
      overflow: hidden;
    }
    .devcard-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .devcard-avatar-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #ec4899);
      color: #ffffff;
    }
    .devcard-status-dot {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 14px;
      height: 14px;
      background: #10b981;
      border: 2px solid #0f172a;
      border-radius: 50%;
    }
    .devcard-name-group {
      flex: 1;
      padding-bottom: 4px;
    }
    .devcard-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .devcard-name {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: var(--devcard-text);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .devcard-verified-icon {
      flex-shrink: 0;
    }
    .devcard-headline {
      margin: 4px 0 0 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--devcard-sub);
      line-height: 1.3;
    }
    .devcard-location {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 5px;
      font-size: 12px;
      color: var(--devcard-bio);
    }
    .devcard-body {
      padding: 16px 24px 12px;
    }
    .devcard-bio {
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--devcard-bio);
      background: rgba(255, 255, 255, 0.03);
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .devcard-section-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--devcard-sub);
      margin-bottom: 8px;
      opacity: 0.85;
    }
    .devcard-skills-section {
      padding: 6px 24px 14px;
    }
    .devcard-skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .devcard-skill-tag {
      font-size: 11.5px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 8px;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
    }
    .devcard-social-section {
      padding: 6px 24px 16px;
    }
    .devcard-social-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .devcard-social-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--devcard-text);
      text-decoration: none;
      padding: 7px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.2s ease;
    }
    .devcard-social-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
      color: #ffffff;
    }
    .devcard-footer {
      padding: 14px 24px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 11.5px;
      color: var(--devcard-sub);
    }
    .devcard-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .devcard-stat-number {
      font-weight: 800;
      color: var(--devcard-text);
    }
    .devcard-footer-branding {
      font-size: 11px;
      opacity: 0.75;
    }
  `;
}

/**
 * Generates a full standalone HTML web page for sharing and iframe previews.
 * @param {object} profile
 * @returns {string} Standalone HTML document
 */
export function renderStandalonePage(profile) {
  const cardMarkup = renderHtmlCard(profile);
  const cardStyles = getCardStyles();
  const fullName = sanitizeHtml(profile.fullName || 'Developer');
  const title = sanitizeHtml(profile.title || 'Profile');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullName} | ${title} - DevCard Studio</title>
  <meta name="description" content="${sanitizeHtml(profile.bio || `${fullName}'s developer profile card`)}">
  <style>
    body {
      margin: 0;
      padding: 40px 16px;
      min-height: 100vh;
      background: #090d16;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    ${cardStyles}
    .devcard-action-bar {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .devcard-page-btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .devcard-page-btn:hover {
      background: #334155;
      border-color: #64748b;
    }
  </style>
</head>
<body>
  ${cardMarkup}
  <div class="devcard-action-bar">
    <a href="/" class="devcard-page-btn">&larr; Create Your DevCard</a>
    <button onclick="navigator.clipboard.writeText(window.location.href);alert('Link copied to clipboard!');" class="devcard-page-btn">Share Profile</button>
  </div>
</body>
</html>`;
}

/**
 * Generates an SVG badge for embedding directly in GitHub README.md files.
 * @param {object} profile
 * @returns {string} SVG xml content
 */
export function renderSvgBadge(profile) {
  const name = sanitizeHtml(profile.fullName || 'Developer');
  const title = sanitizeHtml(profile.title || 'Software Craftsman');
  const badge = sanitizeHtml(profile.badge || 'Verified');
  const initials = extractInitials(profile.fullName);
  const theme = THEMES[profile.theme] || THEMES.aurora;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="130" viewBox="0 0 460 130" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="460" height="130" rx="16" fill="url(#bgGrad)" stroke="${theme.borderColor}" stroke-width="1.5"/>
  <circle cx="55" cy="65" r="32" fill="url(#avatarGrad)"/>
  <text x="55" y="73" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${initials}</text>
  <text x="105" y="52" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold">${name}</text>
  <text x="105" y="74" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">${title}</text>
  <rect x="105" y="86" width="90" height="20" rx="10" fill="rgba(168, 85, 247, 0.2)" stroke="rgba(216, 180, 254, 0.4)"/>
  <text x="150" y="100" fill="#e9d5ff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${badge}</text>
  <text x="440" y="118" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" text-anchor="end">DevCard Studio</text>
</svg>`;
}
