/**
 * Main application coordinator.
 * Orchestrates API calls, state management, audio playback, and rendering.
 */

import {
  USERNAME,
  RANGE_PRESETS,
  DEFAULT_RANGE
} from './config.js';
import {
  fetchUserProfile,
  fetchTopTracks,
  fetchTopArtists,
  fetchTopGenres,
  fetchStreamStats,
  fetchRecentStreams,
  fetchDateStats
} from './api.js';
import {
  renderHeader,
  renderHeroCard,
  renderListeningTime,
  renderTopGenres,
  renderTopTracksList,
  renderTopArtists,
  renderListeningIntensity,
  renderRecentStreams,
  renderSkeletons,
  renderCardError,
  renderRecapModal,
  downloadRecapAsImage
} from './render.js';

// Application State
let currentRange = DEFAULT_RANGE;
let cachedProfile = null;
let currentAudio = null;
let currentPlayingBtn = null;
let currentPlayingWrapper = null;
let isModalOpen = false;
let currentDashboardData = {
  profile: null,
  stats: null,
  topTracks: null,
  topArtists: null,
  topGenres: null,
  dateStats: null
};

/**
 * Initializes the audio player and preview controls.
 */
function setupAudioPlayer() {
  currentAudio = new Audio();
  currentAudio.volume = 0.8;

  currentAudio.addEventListener('ended', () => {
    resetAudioUI();
  });

  currentAudio.addEventListener('pause', () => {
    resetAudioUI();
  });

  currentAudio.addEventListener('error', (e) => {
    console.warn('Audio preview error:', e);
    resetAudioUI();
  });

  // Event delegation for preview play buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-audio-preview, .row-preview-btn, .recent-play-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const previewUrl = btn.dataset.previewUrl;
    if (!previewUrl) return;

    if (currentAudio.src === previewUrl && !currentAudio.paused) {
      currentAudio.pause();
      resetAudioUI();
    } else {
      playAudioPreview(previewUrl, btn);
    }
  });
}

function playAudioPreview(url, btn) {
  resetAudioUI();

  currentAudio.src = url;
  currentPlayingBtn = btn;
  btn.classList.add('playing');

  const playIcon = btn.querySelector('.icon-play');
  const pauseIcon = btn.querySelector('.icon-pause');
  const wave = btn.querySelector('.preview-wave');
  const btnText = btn.querySelector('.preview-btn-text');

  if (playIcon) playIcon.classList.add('hidden');
  if (pauseIcon) pauseIcon.classList.remove('hidden');
  if (wave) wave.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Pause Preview';

  // If hero preview, spin vinyl
  const heroWrapper = document.getElementById('hero-vinyl-wrapper');
  if (heroWrapper && btn.closest('#card-hero-track')) {
    heroWrapper.classList.add('playing');
    currentPlayingWrapper = heroWrapper;
  }

  currentAudio.play().catch(err => {
    console.warn('Playback prevented or aborted:', err);
    resetAudioUI();
  });
}

function resetAudioUI() {
  if (currentPlayingBtn) {
    currentPlayingBtn.classList.remove('playing');
    const playIcon = currentPlayingBtn.querySelector('.icon-play');
    const pauseIcon = currentPlayingBtn.querySelector('.icon-pause');
    const wave = currentPlayingBtn.querySelector('.preview-wave');
    const btnText = currentPlayingBtn.querySelector('.preview-btn-text');

    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    if (wave) wave.classList.add('hidden');
    if (btnText) btnText.textContent = 'Play 30s Preview';
    currentPlayingBtn = null;
  }

  if (currentPlayingWrapper) {
    currentPlayingWrapper.classList.remove('playing');
    currentPlayingWrapper = null;
  }
}

/**
 * Shows an elegant toast notification.
 */
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-container';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span class="toast-msg"></span>
    `;
    document.body.appendChild(toast);
  }

  toast.querySelector('.toast-msg').textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/**
 * Opens the polished Weekly Recap modal with current dashboard data.
 */
function openWeeklyRecapModal() {
  const modal = document.getElementById('recap-modal');
  if (!modal) return;

  renderRecapModal(
    currentDashboardData,
    closeWeeklyRecapModal,
    handleSaveStoryImage,
    handleCopyRecapLink
  );

  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    modal.classList.add('active');
  });

  document.body.style.overflow = 'hidden';
  isModalOpen = true;

  const closeBtn = document.getElementById('recap-close-btn');
  if (closeBtn) closeBtn.focus();
}

/**
 * Closes the Weekly Recap modal and restores scrolling.
 */
function closeWeeklyRecapModal() {
  const modal = document.getElementById('recap-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  setTimeout(() => {
    modal.setAttribute('hidden', '');
  }, 220);

  document.body.style.overflow = '';
  isModalOpen = false;
}

/**
 * Generates and downloads the 9:16 vertical recap story image.
 */
function handleSaveStoryImage(data) {
  showToast('Generating story image...');
  downloadRecapAsImage(data || currentDashboardData, () => {
    showToast('Recap story image downloaded!');
  });
}

/**
 * Copies recap link to clipboard.
 */
function handleCopyRecapLink() {
  const shareUrl = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast('Recap link copied to clipboard!'))
      .catch(() => showToast('Share link: ' + shareUrl));
  } else {
    showToast('Share link: ' + shareUrl);
  }
}

/**
 * Loads and renders the dashboard for the selected range.
 */
async function loadDashboard(rangeId, forceRefresh = false) {
  currentRange = rangeId;
  const rangeConfig = RANGE_PRESETS[rangeId] || RANGE_PRESETS['this-week'];
  const rangeParams = rangeConfig.params;

  // Stop any active audio preview
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
  resetAudioUI();

  // Render skeletons for smooth perceived performance
  renderSkeletons();

  // Fetch user profile if not cached in memory
  if (!cachedProfile) {
    try {
      cachedProfile = await fetchUserProfile(USERNAME, forceRefresh);
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  }

  // Parallel requests using Promise.allSettled to guarantee complete fault isolation
  const [
    tracksResult,
    artistsResult,
    genresResult,
    statsResult,
    recentResult,
    datesResult
  ] = await Promise.allSettled([
    fetchTopTracks(USERNAME, rangeParams, 10, forceRefresh),
    fetchTopArtists(USERNAME, rangeParams, 5, forceRefresh),
    fetchTopGenres(USERNAME, rangeParams, 5, forceRefresh),
    fetchStreamStats(USERNAME, rangeParams, forceRefresh),
    fetchRecentStreams(USERNAME, 10, forceRefresh),
    fetchDateStats(USERNAME, rangeParams, forceRefresh)
  ]);

  // Extract resolved values or null
  const topTracks = tracksResult.status === 'fulfilled' ? tracksResult.value : null;
  const topArtists = artistsResult.status === 'fulfilled' ? artistsResult.value : null;
  const topGenres = genresResult.status === 'fulfilled' ? genresResult.value : null;
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
  const recentStreams = recentResult.status === 'fulfilled' ? recentResult.value : null;
  const dateStats = datesResult.status === 'fulfilled' ? datesResult.value : null;

  // Cache current dashboard data for modal, canvas export, and sharing
  currentDashboardData = {
    profile: cachedProfile,
    stats,
    topTracks,
    topArtists,
    topGenres,
    dateStats
  };

  // Render Header
  renderHeader(cachedProfile, stats, currentRange, (newRange) => {
    loadDashboard(newRange);
  }, openWeeklyRecapModal);

  // Render Hero Card (#1 Top Track)
  if (tracksResult.status === 'fulfilled') {
    const topTrack = topTracks && topTracks.length > 0 ? topTracks[0] : null;
    renderHeroCard(topTrack, stats, dateStats);
  } else {
    renderCardError('card-hero-track', "Couldn't load Top Track");
  }

  // Render Listening Time Card
  if (statsResult.status === 'fulfilled') {
    renderListeningTime(stats);
  } else {
    renderCardError('card-listening-time', "Couldn't load listening duration");
  }

  // Render Top Genres Card
  if (genresResult.status === 'fulfilled') {
    renderTopGenres(topGenres);
  } else {
    renderCardError('card-top-genres', "Couldn't load genres");
  }

  // Render 10 Top Tracks List
  if (tracksResult.status === 'fulfilled') {
    renderTopTracksList(topTracks);
  } else {
    renderCardError('card-top-tracks', "Couldn't load top tracks list");
  }

  // Render Top Artists Card
  if (artistsResult.status === 'fulfilled') {
    renderTopArtists(topArtists);
  } else {
    renderCardError('card-top-artists', "Couldn't load top artists");
  }

  // Render Listening Intensity Heatmap (guaranteed graceful fallback, never displays an error)
  renderListeningIntensity(dateStats);

  // Render Live / Recent Streams
  if (recentResult.status === 'fulfilled') {
    renderRecentStreams(recentStreams);
  } else {
    renderCardError('card-recent-streams', "Couldn't load recent streams");
  }
}

// Global keyboard handler: Escape closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isModalOpen) {
    closeWeeklyRecapModal();
  }
});

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  setupAudioPlayer();
  loadDashboard(currentRange);
});
