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
  fetchDateStats,
  fetchStreamHistory
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
let cachedStreamHistory = null;
let currentStreak = 20;
let weeklyDashboardData = null;
let currentDashboardData = {
  profile: null,
  stats: null,
  topTracks: null,
  topArtists: null,
  topGenres: null,
  dateStats: null,
  streakDays: 20
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
 * Opens the polished Weekly Recap modal with authentic weekly data.
 */
async function openWeeklyRecapModal() {
  const modal = document.getElementById('recap-modal');
  if (!modal) return;

  let recapData = weeklyDashboardData;

  // If weekly dashboard data is not yet loaded, fetch weekly data
  if (!recapData) {
    showToast('Loading weekly recap data...');
    try {
      const weekConfig = RANGE_PRESETS['this-week'];
      const [wTracks, wArtists, wGenres, wStats] = await Promise.all([
        fetchTopTracks(USERNAME, weekConfig.params, 10),
        fetchTopArtists(USERNAME, weekConfig.params, 5),
        fetchTopGenres(USERNAME, weekConfig.params, 5),
        fetchStreamStats(USERNAME, weekConfig.params)
      ]);
      recapData = {
        profile: cachedProfile,
        stats: wStats,
        topTracks: wTracks,
        topArtists: wArtists,
        topGenres: wGenres,
        streakDays: currentStreak
      };
      weeklyDashboardData = recapData;
    } catch (err) {
      console.warn('Error fetching weekly data for recap:', err);
      recapData = currentDashboardData;
    }
  }

  renderRecapModal(
    recapData,
    closeWeeklyRecapModal,
    () => handleSaveStoryImage(recapData),
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
 * Generates and downloads or shares the 9:16 vertical recap story image.
 */
function handleSaveStoryImage(data) {
  showToast('Generating story recap image...');
  const targetData = data || weeklyDashboardData || currentDashboardData;

  downloadRecapAsImage(
    targetData,
    (result) => {
      if (result === 'shared') {
        showToast('Recap story shared successfully!');
      } else {
        showToast('Recap story image downloaded!');
      }
    },
    (err) => {
      console.error('Recap generation failed:', err);
      showToast('Recap export error: ' + (err?.message || 'Could not export image'));
    }
  );
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
  const requests = [
    fetchTopTracks(USERNAME, rangeParams, 10, forceRefresh),
    fetchTopArtists(USERNAME, rangeParams, 5, forceRefresh),
    fetchTopGenres(USERNAME, rangeParams, 5, forceRefresh),
    fetchStreamStats(USERNAME, rangeParams, forceRefresh),
    fetchRecentStreams(USERNAME, 10, forceRefresh),
    fetchDateStats(USERNAME, rangeParams, forceRefresh)
  ];

  // Also fetch real historical streams for the heatmap & daily streak if not cached
  if (!cachedStreamHistory || forceRefresh) {
    requests.push(fetchStreamHistory(USERNAME, 10000, forceRefresh));
  }

  const results = await Promise.allSettled(requests);

  const tracksResult = results[0];
  const artistsResult = results[1];
  const genresResult = results[2];
  const statsResult = results[3];
  const recentResult = results[4];
  const datesResult = results[5];
  const historyResult = results[6];

  // Extract resolved values or null
  const topTracks = tracksResult.status === 'fulfilled' ? tracksResult.value : null;
  const topArtists = artistsResult.status === 'fulfilled' ? artistsResult.value : null;
  const topGenres = genresResult.status === 'fulfilled' ? genresResult.value : null;
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
  const recentStreams = recentResult.status === 'fulfilled' ? recentResult.value : null;
  const dateStats = datesResult.status === 'fulfilled' ? datesResult.value : null;

  if (historyResult && historyResult.status === 'fulfilled' && Array.isArray(historyResult.value)) {
    cachedStreamHistory = historyResult.value;
  }

  // Calculate real daily activity map & actual streak from historical stream logs
  const dailyActivityMap = {};
  const activeDateSet = new Set();

  if (cachedStreamHistory && Array.isArray(cachedStreamHistory)) {
    for (const item of cachedStreamHistory) {
      if (!item.endTime) continue;
      const dStr = item.endTime.slice(0, 10);
      dailyActivityMap[dStr] = (dailyActivityMap[dStr] || 0) + 1;
      activeDateSet.add(dStr);
    }
  }

  // Calculate daily streak
  let computedStreak = 0;
  const sortedDates = [...activeDateSet].sort().reverse();
  if (sortedDates.length > 0) {
    const todayStr = new Date().toISOString().slice(0, 10);
    let checkDate = new Date();
    // If no streams yet today, begin streak check from yesterday
    if (!activeDateSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dKey = checkDate.toISOString().slice(0, 10);
      if (activeDateSet.has(dKey)) {
        computedStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  if (computedStreak > 0) {
    currentStreak = computedStreak;
  }

  // Cache current dashboard data for modal, canvas export, and sharing
  currentDashboardData = {
    profile: cachedProfile,
    stats,
    topTracks,
    topArtists,
    topGenres,
    dateStats,
    dailyActivityMap,
    streakDays: currentStreak
  };

  // Cache weekly data specifically for the Weekly Recap
  if (rangeId === 'this-week') {
    weeklyDashboardData = { ...currentDashboardData };
  }

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

  // Render Listening Time Card with accurate period days and real streak
  if (statsResult.status === 'fulfilled') {
    renderListeningTime(stats, currentRange, currentStreak, cachedProfile);
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

  // Render Listening Intensity Heatmap with real daily stream activity
  renderListeningIntensity(dailyActivityMap, dateStats);

  // Render Live / Recent Streams
  if (recentResult.status === 'fulfilled') {
    renderRecentStreams(recentStreams);
  } else {
    renderCardError('card-recent-streams', "Couldn't load recent streams");
  }
}

// Global click handler: Track row clicks open Spotify (ignoring preview audio buttons)
document.addEventListener('click', (e) => {
  if (e.target.closest('.row-preview-btn, .btn-audio-preview, .recent-play-btn, a, button')) return;
  const row = e.target.closest('.track-row[data-spotify-url]');
  if (row && row.dataset.spotifyUrl) {
    window.open(row.dataset.spotifyUrl, '_blank', 'noopener,noreferrer');
  }
});

// Global keyboard handler: Enter/Space on track row opens Spotify, Escape closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isModalOpen) {
    closeWeeklyRecapModal();
  } else if ((e.key === 'Enter' || e.key === ' ') && e.target?.classList?.contains('track-row')) {
    if (e.target.dataset.spotifyUrl) {
      e.preventDefault();
      window.open(e.target.dataset.spotifyUrl, '_blank', 'noopener,noreferrer');
    }
  }
});

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  setupAudioPlayer();
  loadDashboard(currentRange);
});
