import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractInitials,
  generateSlug,
  parseSkills,
  normalizeSocialLinks,
  calculateProfileStats,
  sanitizeHtml,
  resolveAvatarUrl,
} from '../src/utils/stringUtils.js';
import {
  validateProfileInput,
  previewProfileCard,
  createProfile,
  listProfiles,
  getProfile,
  getProfileBySlugHandler,
  updateProfileHandler,
  deleteProfileHandler,
  renderCardPage,
  renderCardEmbed,
  renderCardSvg,
} from '../src/controllers/profileController.js';
import { renderHtmlCard, renderStandalonePage, renderSvgBadge, THEMES } from '../src/utils/cardRenderer.js';
import { resetStorage } from '../src/utils/storage.js';

// Mock Response Helper for fast in-process testing without network dependencies
function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, val) {
      this.headers[name.toLowerCase()] = val;
      return this;
    },
    json(data) {
      this.headers['content-type'] = 'application/json';
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test.beforeEach(() => {
  resetStorage();
});

// ==========================================
// 1. String Utilities Tests
// ==========================================
test('StringUtils: extractInitials extracts proper 2-letter uppercase initials', () => {
  assert.equal(extractInitials('Lava Kumar'), 'LK');
  assert.equal(extractInitials('Ananya'), 'AN');
  assert.equal(extractInitials('John Ronald Reuel Tolkien'), 'JT');
  assert.equal(extractInitials(''), 'DC');
});

test('StringUtils: generateSlug converts name into safe hyphenated slug', () => {
  const slug = generateSlug('Lava Kumar', 'test1');
  assert.equal(slug, 'lava-kumar-test1');

  const messySlug = generateSlug('  Special &*# Characters Developer  ', 'xyz');
  assert.equal(messySlug, 'special-characters-developer-xyz');
});

test('StringUtils: parseSkills cleans, deduplicates, and styles skill badges', () => {
  const skills = parseSkills('Node.js, Express, node.js; React,  Tailwind CSS | Docker');
  assert.equal(skills.length, 5); // Node.js deduplicated
  assert.equal(skills[0].name, 'Node.js');
  assert.ok(skills[0].color.bg);
  assert.ok(skills[0].color.text);
  assert.ok(skills[0].color.border);
});

test('StringUtils: normalizeSocialLinks normalizes handles into valid URLs', () => {
  const normalized = normalizeSocialLinks({
    github: '@lavach02-arch',
    linkedin: 'in/lavach',
    twitter: 'lavach_dev',
    website: 'lavach.dev',
    email: 'test@example.com',
  });

  assert.equal(normalized.github.url, 'https://github.com/lavach02-arch');
  assert.equal(normalized.linkedin.url, 'https://www.linkedin.com/in/lavach');
  assert.equal(normalized.twitter.url, 'https://x.com/lavach_dev');
  assert.equal(normalized.website.url, 'https://lavach.dev');
  assert.equal(normalized.email.url, 'mailto:test@example.com');
});

test('StringUtils: calculateProfileStats returns accurate metrics', () => {
  const stats = calculateProfileStats({
    fullName: 'Lava Kumar',
    title: 'Senior Developer',
    bio: 'This is a sample bio sentence.',
    skills: [{ name: 'JavaScript' }, { name: 'Node.js' }, { name: 'Express' }],
    socialLinks: { github: { url: 'https://github.com' } },
  });

  assert.equal(stats.wordCount, 6);
  assert.ok(stats.completionPercent >= 80);
});

test('StringUtils: sanitizeHtml escapes malicious tags', () => {
  const dirty = '<script>alert("xss")</script>';
  const clean = sanitizeHtml(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.ok(clean.includes('&lt;script&gt;'));
});

test('StringUtils: resolveAvatarUrl generates valid DiceBear URLs', () => {
  const bottts = resolveAvatarUrl('John Doe', 'bottts');
  assert.ok(bottts.includes('api.dicebear.com'));
  assert.ok(bottts.includes('bottts'));

  const custom = resolveAvatarUrl('John Doe', 'custom', 'https://example.com/avatar.png');
  assert.equal(custom, 'https://example.com/avatar.png');
});

// ==========================================
// 2. Validation Tests
// ==========================================
test('Validation: rejects empty fullName with error message', () => {
  const result = validateProfileInput({ fullName: '', title: 'Developer' });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName);
});

test('Validation: rejects empty title with error message', () => {
  const result = validateProfileInput({ fullName: 'John Doe', title: '' });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.title);
});

test('Validation: rejects invalid theme name', () => {
  const result = validateProfileInput({ fullName: 'John Doe', title: 'Dev', theme: 'neon-space' });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.theme);
});

test('Validation: rejects malformed email address', () => {
  const result = validateProfileInput({ fullName: 'John Doe', title: 'Dev', email: 'not-an-email' });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.email);
});

// ==========================================
// 3. Controller & Rendering Tests
// ==========================================
test('Controller: previewProfileCard generates dynamic HTML card without saving to database', () => {
  const req = {
    body: {
      fullName: 'Realtime Previewer',
      title: 'UI Engineer',
      skills: 'React, Tailwind CSS, TypeScript',
      theme: 'midnight',
    },
  };
  const res = createMockRes();

  previewProfileCard(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.profile.fullName, 'Realtime Previewer');
  assert.ok(res.body.htmlCard.includes('Realtime Previewer'));
  assert.ok(res.body.htmlCard.includes('midnight'));
});

let createdProfileId;
let createdSlug;

test('Controller: createProfile stores profile and returns dynamic HTML card', () => {
  const req = {
    body: {
      fullName: 'Kavya Reddy',
      title: 'Lead Cloud Architect',
      bio: 'Designing automated distributed cloud workflows and high-concurrency systems.',
      location: 'Hyderabad, India',
      theme: 'emerald',
      badge: 'Cloud Master',
      skills: 'AWS, Kubernetes, Terraform, Go, Node.js',
      github: 'kavyareddy',
      linkedin: 'kavya-reddy',
      email: 'kavya@cloud.io',
    },
  };
  const res = createMockRes();

  createProfile(req, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.profile.fullName, 'Kavya Reddy');
  assert.ok(res.body.htmlCard.includes('Kavya Reddy'));
  assert.ok(res.body.htmlCard.includes('Cloud Master'));

  createdProfileId = res.body.profile.id;
  createdSlug = res.body.profile.slug;
});

test('Controller: listProfiles supports search and filtering', () => {
  // First ensure profile exists
  createProfile({
    body: {
      fullName: 'Searchable Target',
      title: 'Rust Specialist',
      skills: 'Rust, WebAssembly',
    },
  }, createMockRes());

  const req = { query: { search: 'Searchable' } };
  const res = createMockRes();

  listProfiles(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.profiles.some(p => p.fullName === 'Searchable Target'));
});

test('Controller: getProfile retrieves profile and dynamic HTML card by ID', () => {
  const req = { params: { id: 'prof_seed_001' } };
  const res = createMockRes();

  getProfile(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.profile.fullName, 'Lava Kumar');
  assert.ok(res.body.htmlCard.includes('Lava Kumar'));
});

test('Controller: getProfile returns 404 for invalid ID', () => {
  const req = { params: { id: 'non_existent_id' } };
  const res = createMockRes();

  getProfile(req, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});

test('Controller: getProfileBySlugHandler retrieves profile by slug', () => {
  const req = { params: { slug: 'lava-kumar-seed' } };
  const res = createMockRes();

  getProfileBySlugHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.profile.fullName, 'Lava Kumar');
});

test('Controller: updateProfileHandler updates profile fields and re-renders card', () => {
  const req = {
    params: { id: 'prof_seed_001' },
    body: {
      title: 'Principal Architect & AI Engineer',
      theme: 'midnight',
    },
  };
  const res = createMockRes();

  updateProfileHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.profile.title, 'Principal Architect & AI Engineer');
  assert.equal(res.body.profile.theme, 'midnight');
  // Card renderer sanitizes & to &amp; for XSS safety
  assert.ok(res.body.htmlCard.includes('Principal Architect &amp; AI Engineer'));
});

test('Controller: renderCardPage serves full standalone HTML document', () => {
  const req = { params: { id: 'prof_seed_001' } };
  const res = createMockRes();

  renderCardPage(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(res.headers['content-type'].includes('text/html'));
  assert.ok(res.body.includes('<!DOCTYPE html>'));
  assert.ok(res.body.includes('Lava Kumar'));
});

test('Controller: renderCardEmbed serves embeddable HTML fragment', () => {
  const req = { params: { id: 'prof_seed_001' } };
  const res = createMockRes();

  renderCardEmbed(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(res.headers['content-type'].includes('text/html'));
  assert.ok(res.body.includes('devcard-container'));
});

test('Controller: renderCardSvg serves dynamic SVG badge for GitHub README', () => {
  const req = { params: { id: 'prof_seed_001' } };
  const res = createMockRes();

  renderCardSvg(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(res.headers['content-type'].includes('image/svg+xml'));
  assert.ok(res.body.includes('<svg'));
  assert.ok(res.body.includes('Lava Kumar'));
});

test('Controller: deleteProfileHandler deletes profile from store', () => {
  const req = { params: { id: 'prof_seed_001' } };
  const res = createMockRes();

  deleteProfileHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);

  // Subsequent fetch returns 404
  const verifyRes = createMockRes();
  getProfile(req, verifyRes);
  assert.equal(verifyRes.statusCode, 404);
});
