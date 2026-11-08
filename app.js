/**
 * DevCard Studio - Frontend Client Application
 * Communicates asynchronously with Node.js backend using fetch()
 */

// Application State
const state = {
  currentProfile: null,
  currentHtmlCard: '',
  editingId: null,
  profiles: [],
  activeTab: 'preview',
  debounceTimer: null,
  searchTimer: null,
};

// DOM Element References
const form = document.getElementById('profile-form');
const editIdInput = document.getElementById('field-edit-id');
const nameInput = document.getElementById('field-name');
const titleInput = document.getElementById('field-title');
const locationInput = document.getElementById('field-location');
const badgeSelect = document.getElementById('field-badge');
const bioTextarea = document.getElementById('field-bio');
const skillsInput = document.getElementById('field-skills');
const githubInput = document.getElementById('field-github');
const linkedinInput = document.getElementById('field-linkedin');
const twitterInput = document.getElementById('field-twitter');
const websiteInput = document.getElementById('field-website');
const emailInput = document.getElementById('field-email');
const avatarStyleSelect = document.getElementById('field-avatar-style');
const avatarUrlInput = document.getElementById('field-avatar-url');

const initialsBubble = document.getElementById('initials-bubble');
const bioCounter = document.getElementById('bio-counter');
const completionBadge = document.getElementById('completion-badge');
const cardPreviewTarget = document.getElementById('card-preview-target');
const renderLatency = document.getElementById('render-latency');
const submitText = document.getElementById('submit-text');

const galleryGrid = document.getElementById('gallery-grid');
const gallerySearch = document.getElementById('gallery-search');
const galleryThemeFilter = document.getElementById('gallery-theme-filter');
const galleryTotalBadge = document.getElementById('gallery-total-badge');
const navCount = document.getElementById('nav-count');

const codeIframe = document.getElementById('code-iframe');
const codeMarkdown = document.getElementById('code-markdown');
const badgeSvgPreview = document.getElementById('badge-svg-preview');
const btnOpenFullscreen = document.getElementById('btn-open-fullscreen');

/**
 * Initializes application on DOM load.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Bind form input listeners for live real-time server preview
  bindFormEvents();

  // Bind tab switching
  bindTabEvents();

  // Bind action buttons
  bindActionButtons();

  // Load initial gallery profiles from backend
  loadGalleryProfiles();

  // Trigger initial preview with default values
  triggerServerPreview();
});

/**
 * Binds input and change events for real-time live preview.
 */
function bindFormEvents() {
  const previewInputs = [
    nameInput,
    titleInput,
    locationInput,
    badgeSelect,
    bioTextarea,
    skillsInput,
    githubInput,
    linkedinInput,
    twitterInput,
    websiteInput,
    emailInput,
    avatarStyleSelect,
    avatarUrlInput,
  ];

  previewInputs.forEach((input) => {
    input.addEventListener('input', () => {
      handleInputChange();
      debouncedPreview();
    });
    input.addEventListener('change', () => {
      handleInputChange();
      debouncedPreview();
    });
  });

  // Theme radio buttons
  document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      updateThemeCardVisuals();
      debouncedPreview();
    });
  });

  // Quick-Add skill chips
  document.querySelectorAll('.skill-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const skillName = chip.getAttribute('data-skill');
      addSkill(skillName);
    });
  });

  // Form submit
  form.addEventListener('submit', handleFormSubmit);

  // Gallery search & filter
  gallerySearch.addEventListener('input', () => {
    clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(() => {
      loadGalleryProfiles();
    }, 250);
  });

  galleryThemeFilter.addEventListener('change', () => {
    loadGalleryProfiles();
  });
}

/**
 * Updates UI helpers such as initials, bio counter, and completion status.
 */
function handleInputChange() {
  // Update initials
  const name = nameInput.value.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    initialsBubble.textContent = initials;
  } else {
    initialsBubble.textContent = 'DC';
  }

  // Update bio character & word count
  const bio = bioTextarea.value;
  const words = bio.trim() ? bio.trim().split(/\s+/).length : 0;
  bioCounter.textContent = `${bio.length} / 1200 characters (${words} words)`;

  // Calculate estimated completion
  let score = 0;
  if (name.length >= 2) score += 25;
  if (titleInput.value.trim().length >= 2) score += 20;
  if (bio.length >= 20) score += 20;
  if (skillsInput.value.trim().length >= 3) score += 20;
  if (githubInput.value.trim() || linkedinInput.value.trim() || websiteInput.value.trim()) score += 15;
  completionBadge.textContent = `${score}% complete`;
}

/**
 * Visually highlights selected theme card.
 */
function updateThemeCardVisuals() {
  const selected = document.querySelector('input[name="theme"]:checked')?.value || 'aurora';
  document.querySelectorAll('#theme-selector label').forEach((label) => {
    const radio = label.querySelector('input[type="radio"]');
    if (radio && radio.value === selected) {
      label.className = 'cursor-pointer border-2 border-indigo-500 bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 hover:border-indigo-400 transition-all shadow-md shadow-indigo-500/10';
    } else {
      label.className = 'cursor-pointer border-2 border-slate-700 bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 hover:border-slate-500 transition-all';
    }
  });
}

/**
 * Debounces preview requests so server isn't spammed during fast typing.
 */
function debouncedPreview() {
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => {
    triggerServerPreview();
  }, 180);
}

/**
 * Collects form fields into a payload object.
 */
function getFormData() {
  const selectedTheme = document.querySelector('input[name="theme"]:checked')?.value || 'aurora';

  return {
    fullName: nameInput.value.trim(),
    title: titleInput.value.trim(),
    location: locationInput.value.trim(),
    badge: badgeSelect.value,
    bio: bioTextarea.value.trim(),
    skills: skillsInput.value.trim(),
    github: githubInput.value.trim(),
    linkedin: linkedinInput.value.trim(),
    twitter: twitterInput.value.trim(),
    website: websiteInput.value.trim(),
    email: emailInput.value.trim(),
    theme: selectedTheme,
    avatarStyle: avatarStyleSelect.value,
    avatarUrl: avatarUrlInput.value.trim(),
  };
}

/**
 * Calls POST /api/profiles/preview to retrieve dynamic HTML card.
 */
async function triggerServerPreview() {
  const payload = getFormData();
  const startTime = performance.now();

  try {
    const response = await fetch('/api/profiles/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);
    renderLatency.textContent = `SSR: ${duration}ms`;

    if (data.success && data.htmlCard) {
      state.currentProfile = data.profile;
      state.currentHtmlCard = data.htmlCard;

      // Inject dynamically rendered card
      cardPreviewTarget.innerHTML = data.htmlCard;

      // Update snippet tabs
      updateCodeSnippets(data.profile);
    }
  } catch (err) {
    console.error('Preview request error:', err);
  }
}

/**
 * Updates code snippet tabs for iframe embedding & Markdown README badges.
 */
function updateCodeSnippets(profile) {
  const idOrSlug = profile.id && profile.id !== 'preview' ? profile.id : (profile.slug || 'preview');
  const origin = window.location.origin;

  const embedUrl = `${origin}/cards/${idOrSlug}/embed`;
  const standaloneUrl = `${origin}/cards/${idOrSlug}`;
  const svgUrl = `${origin}/cards/${idOrSlug}/svg`;

  // Iframe snippet
  codeIframe.textContent = `<iframe \n  src="${embedUrl}" \n  width="100%" \n  height="480" \n  frameborder="0" \n  style="border-radius: 20px; overflow: hidden;" \n  title="${profile.fullName} DevCard">\n</iframe>`;

  // Markdown README badge snippet
  codeMarkdown.textContent = `[![${profile.fullName}'s DevCard](${svgUrl})](${standaloneUrl})`;

  // Update SVG preview image
  badgeSvgPreview.src = svgUrl;

  // Update standalone link
  btnOpenFullscreen.href = standaloneUrl;
}

/**
 * Adds a skill from quick-add chips to the skills input.
 */
function addSkill(skillName) {
  let current = skillsInput.value.trim();
  const list = current ? current.split(',').map((s) => s.trim().toLowerCase()) : [];

  if (!list.includes(skillName.toLowerCase())) {
    current = current ? `${current}, ${skillName}` : skillName;
    skillsInput.value = current;
    handleInputChange();
    debouncedPreview();
    showToast(`Added "${skillName}" to skills`, 'info');
  }
}

/**
 * Handles Form Submission: creates new or updates existing profile.
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const payload = getFormData();
  const editingId = editIdInput.value;
  const isEditing = Boolean(editingId);

  // Clear previous validation error messages
  hideErrors();

  submitText.textContent = isEditing ? 'Updating Profile...' : 'Generating DevCard...';

  try {
    const url = isEditing ? `/api/profiles/${editingId}` : '/api/profiles';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        showFieldErrors(data.errors);
      }
      showToast(data.message || 'Validation failed', 'error');
      return;
    }

    showToast(isEditing ? 'Profile updated successfully!' : 'DevCard generated and stored in database!', 'success');

    // Update state & preview
    state.currentProfile = data.profile;
    state.currentHtmlCard = data.htmlCard;
    cardPreviewTarget.innerHTML = data.htmlCard;
    updateCodeSnippets(data.profile);

    // Refresh community gallery
    loadGalleryProfiles();

    // Reset edit mode if editing was done
    if (isEditing) {
      exitEditMode();
    }
  } catch (err) {
    console.error('Submit error:', err);
    showToast('Network error while saving profile card', 'error');
  } finally {
    submitText.textContent = isEditing ? 'Update DevCard' : 'Generate & Save DevCard';
  }
}

/**
 * Displays field-level validation errors from server response.
 */
function showFieldErrors(errors) {
  if (errors.fullName) {
    const el = document.getElementById('err-name');
    el.textContent = errors.fullName;
    el.classList.remove('hidden');
    nameInput.focus();
  }
  if (errors.title) {
    const el = document.getElementById('err-title');
    el.textContent = errors.title;
    el.classList.remove('hidden');
    if (!errors.fullName) titleInput.focus();
  }
  if (errors.email) {
    const el = document.getElementById('err-email');
    el.textContent = errors.email;
    el.classList.remove('hidden');
  }
}

/**
 * Hides all field error messages.
 */
function hideErrors() {
  document.getElementById('err-name').classList.add('hidden');
  document.getElementById('err-title').classList.add('hidden');
  document.getElementById('err-email').classList.add('hidden');
}

/**
 * Loads profiles for the Community Directory from GET /api/profiles.
 */
async function loadGalleryProfiles() {
  const q = gallerySearch.value.trim();
  const theme = galleryThemeFilter.value;

  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (theme) params.set('theme', theme);

  try {
    const res = await fetch(`/api/profiles?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      state.profiles = data.profiles || [];
      galleryTotalBadge.textContent = `${data.total} Profiles`;
      navCount.textContent = data.total;
      renderGalleryCards(state.profiles);
    }
  } catch (err) {
    console.error('Failed to load gallery profiles:', err);
  }
}

/**
 * Renders profile cards in the community gallery grid.
 */
function renderGalleryCards(profiles) {
  if (profiles.length === 0) {
    galleryGrid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
        <i data-lucide="inbox" class="w-10 h-10 text-slate-600 mx-auto mb-2"></i>
        <h4 class="text-sm font-semibold text-slate-300">No profile cards found</h4>
        <p class="text-xs text-slate-500 mt-1">Try another search term or generate a new card above!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  galleryGrid.innerHTML = profiles
    .map((p) => {
      const skillsHtml = (p.skills || [])
        .slice(0, 5)
        .map(
          (s) =>
            `<span class="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">${s.name || s}</span>`
        )
        .join('');

      return `
        <div class="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-5 shadow-lg flex flex-col justify-between transition-all group">
          <div>
            <!-- Top bar -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">${p.badge || 'Developer'}</span>
              <span class="text-[10px] font-mono text-slate-500 uppercase">${p.theme || 'aurora'}</span>
            </div>

            <!-- Avatar & Name -->
            <div class="flex items-center gap-3 mb-3">
              <img src="${p.avatarUrl}" alt="${p.fullName}" class="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 object-cover flex-shrink-0" />
              <div class="overflow-hidden">
                <h4 class="font-bold text-sm text-slate-100 truncate">${p.fullName}</h4>
                <p class="text-xs text-slate-400 truncate">${p.title}</p>
                ${p.location ? `<p class="text-[11px] text-slate-500 truncate mt-0.5">${p.location}</p>` : ''}
              </div>
            </div>

            <!-- Bio snippet -->
            <p class="text-xs text-slate-300 line-clamp-2 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              ${p.bio || 'No bio provided.'}
            </p>

            <!-- Skills -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              ${skillsHtml}
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <button onclick="loadProfileIntoStudio('${p.id}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1">
                <i data-lucide="edit-3" class="w-3 h-3"></i> Edit
              </button>
              <a href="/cards/${p.id}" target="_blank" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1">
                <i data-lucide="external-link" class="w-3 h-3"></i> View
              </a>
            </div>

            <button onclick="deleteProfileCard('${p.id}', '${p.fullName.replace(/'/g, "\\'")}')" class="p-1.5 text-slate-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors" title="Delete Card">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Loads a profile from gallery into studio for inspection or editing.
 */
window.loadProfileIntoStudio = async function (id) {
  try {
    const res = await fetch(`/api/profiles/${id}`);
    const data = await res.json();

    if (data.success && data.profile) {
      const p = data.profile;
      editIdInput.value = p.id;
      nameInput.value = p.fullName || '';
      titleInput.value = p.title || '';
      locationInput.value = p.location || '';
      badgeSelect.value = p.badge || 'Pro Developer';
      bioTextarea.value = p.bio || '';

      const skillsStr = (p.skills || []).map((s) => s.name || s).join(', ');
      skillsInput.value = skillsStr;

      githubInput.value = p.socialLinks?.github?.username?.replace(/^@/, '') || '';
      linkedinInput.value = p.socialLinks?.linkedin?.username?.replace(/^in\//, '') || '';
      twitterInput.value = p.socialLinks?.twitter?.username || '';
      websiteInput.value = p.socialLinks?.website?.url || '';
      emailInput.value = p.socialLinks?.email?.username || '';

      avatarStyleSelect.value = p.avatarStyle || 'bottts';
      avatarUrlInput.value = p.avatarUrl && !p.avatarUrl.includes('dicebear.com') ? p.avatarUrl : '';

      // Set theme radio
      const themeRadio = document.querySelector(`input[name="theme"][value="${p.theme}"]`);
      if (themeRadio) themeRadio.checked = true;

      updateThemeCardVisuals();
      handleInputChange();
      debouncedPreview();

      submitText.textContent = 'Update DevCard';
      showToast(`Loaded "${p.fullName}" into Studio for editing`, 'info');

      // Smooth scroll to studio form
      form.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error('Error loading profile into studio:', err);
  }
};

/**
 * Deletes a profile card after confirmation.
 */
window.deleteProfileCard = async function (id, name) {
  if (!confirm(`Are you sure you want to delete the profile card for "${name}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      showToast(`Profile card "${name}" deleted`, 'success');
      loadGalleryProfiles();

      // If deleted active edit profile, reset edit mode
      if (editIdInput.value === id) {
        exitEditMode();
        triggerServerPreview();
      }
    } else {
      showToast(data.message || 'Failed to delete profile', 'error');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Failed to communicate with server', 'error');
  }
};

/**
 * Exits edit mode and clears edit state.
 */
function exitEditMode() {
  editIdInput.value = '';
  submitText.textContent = 'Generate & Save DevCard';
}

/**
 * Binds tab switching between Preview, HTML Embed, and Markdown Badge.
 */
function bindTabEvents() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      state.activeTab = targetTab;

      // Update tab buttons
      tabs.forEach((t) => {
        t.className = 'tab-btn flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition-colors';
      });
      tab.className = 'tab-btn flex-1 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white transition-colors';

      // Switch content panels
      document.querySelectorAll('.tab-content').forEach((panel) => {
        panel.classList.add('hidden');
      });
      document.getElementById(`tab-content-${targetTab}`).classList.remove('hidden');
    });
  });
}

/**
 * Binds copy, download, sample-fill, and reset buttons.
 */
function bindActionButtons() {
  // Fill sample data
  document.getElementById('btn-fill-sample').addEventListener('click', () => {
    nameInput.value = 'Lava Kumar';
    titleInput.value = 'Full-Stack Developer & Cloud Architect';
    locationInput.value = 'Hyderabad, India';
    badgeSelect.value = 'Pro Developer';
    bioTextarea.value =
      'Passionate about crafting resilient microservices, responsive web applications, and automated developer tooling. Active open-source enthusiast and tech mentor.';
    skillsInput.value = 'JavaScript, Node.js, Express, React, PostgreSQL, Docker, AWS, Tailwind CSS';
    githubInput.value = 'lavach02-arch';
    linkedinInput.value = 'lavach';
    twitterInput.value = '@lavach_dev';
    websiteInput.value = 'https://lavach.dev';
    emailInput.value = 'lavach@example.com';
    avatarStyleSelect.value = 'bottts';
    avatarUrlInput.value = '';

    const auroraRadio = document.querySelector('input[name="theme"][value="aurora"]');
    if (auroraRadio) auroraRadio.checked = true;

    exitEditMode();
    updateThemeCardVisuals();
    handleInputChange();
    debouncedPreview();
    showToast('Loaded sample developer profile data!', 'info');
  });

  // Reset form
  document.getElementById('btn-reset-form').addEventListener('click', () => {
    form.reset();
    exitEditMode();
    updateThemeCardVisuals();
    handleInputChange();
    debouncedPreview();
    showToast('Form cleared', 'info');
  });

  // Copy card HTML
  document.getElementById('btn-copy-card-html').addEventListener('click', () => {
    if (!state.currentHtmlCard) return;
    navigator.clipboard.writeText(state.currentHtmlCard).then(() => {
      showToast('Dynamic Card HTML copied to clipboard!', 'success');
    });
  });

  // Download .html file
  document.getElementById('btn-download-html').addEventListener('click', () => {
    if (!state.currentProfile) return;
    const p = state.currentProfile;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${p.fullName} - DevCard</title>
  <style>
    body { background: #090d16; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; padding: 20px; font-family: sans-serif; }
  </style>
</head>
<body>
  ${state.currentHtmlCard}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.slug || 'profile'}-card.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${a.download}!`, 'success');
  });

  // Copy iframe code
  document.getElementById('btn-copy-iframe').addEventListener('click', () => {
    navigator.clipboard.writeText(codeIframe.textContent).then(() => {
      showToast('Embed <iframe> code copied!', 'success');
    });
  });

  // Copy markdown badge
  document.getElementById('btn-copy-markdown').addEventListener('click', () => {
    navigator.clipboard.writeText(codeMarkdown.textContent).then(() => {
      showToast('Markdown badge code copied!', 'success');
    });
  });
}

/**
 * Toast Notification Helper.
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  let bgClass = 'bg-slate-800 text-slate-100 border-slate-700';
  let iconName = 'info';

  if (type === 'success') {
    bgClass = 'bg-emerald-950/95 text-emerald-100 border-emerald-700 shadow-emerald-900/30';
    iconName = 'check-circle';
  } else if (type === 'error') {
    bgClass = 'bg-pink-950/95 text-pink-100 border-pink-700 shadow-pink-900/30';
    iconName = 'alert-triangle';
  } else if (type === 'info') {
    bgClass = 'bg-indigo-950/95 text-indigo-100 border-indigo-700 shadow-indigo-900/30';
    iconName = 'sparkles';
  }

  toast.className = `pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold transition-all transform translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3500);
}
