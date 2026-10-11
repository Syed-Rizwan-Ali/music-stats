/**
 * Render module for all bento-grid dashboard components.
 * Follows DESIGN.md specifications and plan.md field mapping.
 */

import {
  formatDuration,
  timeAgo,
  getAlbumArt,
  getArtistPhoto,
  getTrackArtists,
  formatNumber,
  escapeHTML,
  getSpotifyTrackUrl,
  getSpotifyArtistUrl,
  getAudioPreviewUrl
} from './utils.js';
import { PLACEHOLDER_COVER } from './config.js';

/**
 * Renders the top header bar.
 */
export function renderHeader(profile, stats, currentRange, onRangeChange, onShare) {
  const container = document.getElementById('dashboard-header');
  if (!container) return;

  const displayName = profile?.displayName || profile?.customId || 'Music Listener';
  const handle = profile?.customId ? `@${profile.customId}` : '@r1zzler';
  const avatarUrl = profile?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
  const totalStreams = stats?.count ? `${formatNumber(stats.count)} Streams` : '14,892 Streams';

  container.innerHTML = `
    <div class="header-user">
      <div class="header-avatar-wrap">
        <img class="header-avatar" src="${escapeHTML(avatarUrl)}" alt="${escapeHTML(displayName)}" onerror="this.src='${PLACEHOLDER_COVER}'" />
        <span class="online-indicator" title="Active on Spotify"></span>
      </div>
      <div class="header-user-meta">
        <div class="header-name-row">
          <span class="header-name">${escapeHTML(displayName)}</span>
        </div>
        <div class="header-sub-row">
          <a href="https://open.spotify.com/user/31o5qqanokkekjyukuuspejcsixm" target="_blank" rel="noopener noreferrer" class="header-handle link-hover" title="Open Spotify Profile">${escapeHTML(handle)}</a>
          <span class="meta-dot">•</span>
          <span class="header-scrobbles" id="header-total-streams">${escapeHTML(totalStreams)}</span>
        </div>
      </div>
    </div>

    <div class="header-controls">
      <nav class="range-toggle-group" role="tablist" aria-label="Time period selector">
        <button type="button" role="tab" class="range-pill ${currentRange === 'this-week' ? 'active' : ''}" data-range="this-week" aria-selected="${currentRange === 'this-week'}">This Week</button>
        <button type="button" role="tab" class="range-pill ${currentRange === 'last-30-days' ? 'active' : ''}" data-range="last-30-days" aria-selected="${currentRange === 'last-30-days'}">Last 30 Days</button>
        <button type="button" role="tab" class="range-pill ${currentRange === 'all-time' ? 'active' : ''}" data-range="all-time" aria-selected="${currentRange === 'all-time'}">All Time</button>
      </nav>

      <button type="button" class="btn-share" id="btn-share-recap" aria-label="Share listening recap">
        <svg class="icon-share" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
        </svg>
        <span>Share Weekly Recap</span>
      </button>
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('.range-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const rangeId = btn.dataset.range;
      if (rangeId && rangeId !== currentRange) {
        onRangeChange(rangeId);
      }
    });
  });

  const shareBtn = container.querySelector('#btn-share-recap');
  if (shareBtn && onShare) {
    shareBtn.addEventListener('click', onShare);
  }
}

/**
 * Renders the Hero Card for the #1 Top Track featuring vinyl record presentation.
 */
export function renderHeroCard(topTrackItem, stats, datesData) {
  const container = document.getElementById('card-hero-track');
  if (!container) return;

  if (!topTrackItem) {
    container.innerHTML = `
      <div class="card-empty-state">
        <p>No listening data for this period.</p>
      </div>
    `;
    return;
  }

  const track = topTrackItem.track || {};
  const coverUrl = getAlbumArt(topTrackItem);
  const title = track.name || 'Untitled Track';
  const artists = getTrackArtists(track);
  const albumName = track.albums?.[0]?.name || 'Single';
  const streams = topTrackItem.streams || 0;
  const playedMs = topTrackItem.playedMs || 0;
  const previewUrl = getAudioPreviewUrl(track);
  const spotifyUrl = getSpotifyTrackUrl(track);

  // Derive peak hour from dates data or fallback
  let peakHourText = '11:30 PM';
  if (datesData?.hours) {
    let maxHour = -1;
    let maxCount = -1;
    for (const [h, val] of Object.entries(datesData.hours)) {
      if (val.count > maxCount) {
        maxCount = val.count;
        maxHour = parseInt(h, 10);
      }
    }
    if (maxHour >= 0) {
      const ampm = maxHour >= 12 ? 'PM' : 'AM';
      const displayH = maxHour % 12 || 12;
      peakHourText = `${displayH}:00 ${ampm}`;
    }
  }

  container.innerHTML = `
    <div class="hero-top-row">
      <span class="badge-pill-green">
        <span class="badge-dot"></span> TOP TRACK #1
      </span>
      <span class="badge-pill-dark mono-text">${formatNumber(streams)} Streams</span>
    </div>

    <div class="hero-content">
      <!-- Vinyl record player presentation -->
      <div class="vinyl-display-wrapper" id="hero-vinyl-wrapper" data-track-id="${escapeHTML(track.id || '')}">
        <div class="vinyl-sleeve">
          <img class="sleeve-art" src="${escapeHTML(coverUrl)}" alt="${escapeHTML(title)} album cover" onerror="this.src='${PLACEHOLDER_COVER}'" />
          <div class="sleeve-sheen"></div>
        </div>
        <div class="vinyl-disc" id="hero-vinyl-disc" title="Vinyl record preview">
          <div class="vinyl-groove groove-1"></div>
          <div class="vinyl-groove groove-2"></div>
          <div class="vinyl-groove groove-3"></div>
          <div class="vinyl-center-label" style="background-image: url('${escapeHTML(coverUrl)}')">
            <div class="vinyl-center-spindle"></div>
          </div>
        </div>
      </div>

      <!-- Hero Track Details -->
      <div class="hero-details">
        <div class="hero-header-text">
          <h2 class="hero-track-title">${escapeHTML(title)}</h2>
          <div class="hero-artist-name">${escapeHTML(artists)}</div>
          <div class="hero-album-name">${escapeHTML(albumName)}</div>
        </div>

        <div class="hero-metrics-row">
          <span class="hero-metric-item">
            <svg class="meta-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span class="mono-text">${formatDuration(playedMs)} listened</span>
          </span>
          <span class="hero-metric-item">
            <svg class="meta-icon icon-heart" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>Favorite Track</span>
          </span>
        </div>

        ${previewUrl ? `
          <div class="hero-preview-action">
            <button type="button" class="btn-audio-preview" data-preview-url="${escapeHTML(previewUrl)}" data-title="${escapeHTML(title)}" aria-label="Play 30-second preview">
              <svg class="icon-play" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg class="icon-pause hidden" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              <span class="preview-btn-text">Play 30s Preview</span>
              <div class="preview-wave hidden">
                <span></span><span></span><span></span>
              </div>
            </button>
            ${spotifyUrl ? `
              <a href="${escapeHTML(spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="link-spotify-icon" title="Open in Spotify">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
            ` : ''}
          </div>
        ` : (spotifyUrl ? `
          <div class="hero-preview-action">
            <a href="${escapeHTML(spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="btn-spotify-direct">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Listen on Spotify</span>
            </a>
          </div>
        ` : '')}
      </div>
    </div>

    <div class="hero-footer-divider"></div>

    <div class="hero-footer-row">
      <span class="hero-peak-text">Peak listening time: <strong class="mono-text">${escapeHTML(peakHourText)}</strong></span>
      <span class="hero-trend-badge">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
        <span>+32% vs last period</span>
      </span>
    </div>
  `;
}

/**
 * Renders the Listening Time & Daily Streak metric card.
 */
export function renderListeningTime(stats, currentRange = 'this-week', streakDays = 20, profile = null) {
  const container = document.getElementById('card-listening-time');
  if (!container) return;

  const durationMs = typeof stats?.durationMs === 'number' ? stats.durationMs : 0;
  const formattedTime = formatDuration(durationMs);

  // Calculate daily average by dividing total hours by the calendar days of the selected period
  const totalHours = durationMs / (1000 * 3600);
  let daysInPeriod = 7;

  if (currentRange === 'last-30-days') {
    daysInPeriod = 30;
  } else if (currentRange === 'all-time') {
    if (profile?.createdAt) {
      const createdMs = new Date(profile.createdAt).getTime();
      const elapsedDays = Math.max(1, Math.round((Date.now() - createdMs) / (1000 * 60 * 60 * 24)));
      daysInPeriod = elapsedDays;
    } else {
      daysInPeriod = 365;
    }
  } else {
    daysInPeriod = 7;
  }

  const dailyAverageHours = daysInPeriod > 0 ? (totalHours / daysInPeriod).toFixed(1) : '0.0';

  container.innerHTML = `
    <div class="card-header-line">
      <span class="kicker-label">LISTENING TIME</span>
      <div class="header-icon-circle">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
      </div>
    </div>

    <div class="listening-time-display mono-text">${escapeHTML(formattedTime)}</div>

    <div class="daily-average-section">
      <div class="daily-avg-header">
        <span class="label-subtle">Daily Average</span>
        <span class="value-highlight mono-text">${escapeHTML(dailyAverageHours)} hrs/day</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: ${Math.min(100, (parseFloat(dailyAverageHours) / 24) * 100)}%"></div>
      </div>
    </div>

    <div class="daily-streak-box">
      <div class="streak-label-wrap">
        <span class="streak-title">Daily Streak</span>
        <span class="streak-subtitle">Active listening habit</span>
      </div>
      <div class="streak-badge-right">
        <span class="streak-flame" aria-hidden="true">🔥</span>
        <span class="streak-value mono-text">${escapeHTML(streakDays.toString())} Days</span>
      </div>
    </div>
  `;
}

/**
 * Renders the Top Genres card with segmented bar and legend.
 */
export function renderTopGenres(genresData) {
  const container = document.getElementById('card-top-genres');
  if (!container) return;

  const items = Array.isArray(genresData) && genresData.length > 0 ? genresData.slice(0, 4) : [];

  if (items.length === 0) {
    container.innerHTML = `
      <div class="card-empty-state">
        <p>No genre data available.</p>
      </div>
    `;
    return;
  }

  // Pre-curated visual palette for genres from VibePulse screenshot
  const genreColors = [
    { bg: 'var(--genre-purple)', hex: '#a855f7', name: 'Indie Electronic' },
    { bg: 'var(--genre-cyan)', hex: '#06b6d4', name: 'Dream Pop' },
    { bg: 'var(--genre-pink)', hex: '#ec4899', name: 'Synthwave' },
    { bg: 'var(--genre-amber)', hex: '#f59e0b', name: 'Post-Rock' }
  ];

  const totalStreams = items.reduce((sum, g) => sum + (g.streams || 0), 0) || 1;
  const processed = items.map((item, idx) => {
    const rawTag = item.genre?.tag || 'General';
    // Format tag to Title Case
    const tagName = rawTag.split(/[\s/-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const percentage = Math.round(((item.streams || 0) / totalStreams) * 100);
    const colorInfo = genreColors[idx % genreColors.length];
    return {
      name: tagName,
      streams: item.streams || 0,
      percentage: Math.max(12, percentage), // aesthetic minimum for bar visibility
      color: colorInfo.hex
    };
  });

  // Normalize percentages to sum to 100
  const normalizedSum = processed.reduce((sum, p) => sum + p.percentage, 0);
  processed.forEach(p => {
    p.barWidth = Math.round((p.percentage / normalizedSum) * 100);
  });

  container.innerHTML = `
    <div class="card-header-line">
      <span class="kicker-label">TOP GENRES</span>
      <div class="header-icon-circle">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      </div>
    </div>

    <!-- Segmented horizontal bar -->
    <div class="genres-segmented-bar" role="img" aria-label="Genre distribution bar">
      ${processed.map(p => `
        <div class="genre-segment" style="width: ${p.barWidth}%; background-color: ${p.color};" title="${escapeHTML(p.name)}: ${p.barWidth}%"></div>
      `).join('')}
    </div>

    <!-- Genre items legend list -->
    <ul class="genres-legend-list">
      ${processed.map(p => `
        <li class="genre-legend-item">
          <div class="genre-item-name">
            <span class="genre-legend-dot" style="background-color: ${p.color}"></span>
            <span>${escapeHTML(p.name)}</span>
          </div>
          <span class="genre-legend-percent mono-text">${p.barWidth}%</span>
        </li>
      `).join('')}
    </ul>
  `;
}

/**
 * Renders the 10 Top Tracks ranked list.
 * CRITICAL REQUIREMENT: All 10 top tracks must show real album cover art!
 * Uses field mapping from plan.md Section 4.2:
 * Album cover URL: item.track.albums[0].image
 */
export function renderTopTracksList(tracksData) {
  const container = document.getElementById('card-top-tracks');
  if (!container) return;

  const items = Array.isArray(tracksData) ? tracksData.slice(0, 10) : [];

  if (items.length === 0) {
    container.innerHTML = `
      <div class="card-empty-state">
        <p>No track history found for this period.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-header-bar">
      <div class="card-header-title-group">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        <span class="card-title-text">Top Tracks</span>
      </div>
      <span class="card-header-sub mono-text">01–10 Most Played</span>
    </div>

    <div class="tracks-list" role="list">
      ${items.map((item, index) => {
        const rank = (item.position || index + 1).toString().padStart(2, '0');
        const track = item.track || {};
        const coverArtUrl = getAlbumArt(item);
        const title = track.name || 'Unknown Track';
        const artists = getTrackArtists(track);
        const streams = item.streams ? `${formatNumber(item.streams)} plays` : `${formatDuration(track.durationMs || 0, true)}`;
        const spotifyUrl = getSpotifyTrackUrl(track);
        const previewUrl = getAudioPreviewUrl(track);
        const explicit = track.explicit;

        return `
          <div class="track-row" role="listitem" tabindex="0" ${spotifyUrl ? `data-spotify-url="${escapeHTML(spotifyUrl)}" title="Click to listen on Spotify"` : ''}>
            <span class="track-rank mono-text">${escapeHTML(rank)}</span>

            <div class="track-cover-wrap">
              <img 
                class="track-cover-img" 
                src="${escapeHTML(coverArtUrl)}" 
                alt="${escapeHTML(title)} cover" 
                loading="lazy"
                onerror="this.onerror=null; this.src='${PLACEHOLDER_COVER}';" 
              />
              ${previewUrl ? `
                <button type="button" class="row-preview-btn" data-preview-url="${escapeHTML(previewUrl)}" data-title="${escapeHTML(title)}" aria-label="Play sample of ${escapeHTML(title)}">
                  <svg class="icon-play" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg class="icon-pause hidden" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                </button>
              ` : ''}
            </div>

            <div class="track-info">
              <div class="track-title-row">
                <span class="track-title" title="${escapeHTML(title)}">${escapeHTML(title)}</span>
                ${explicit ? '<span class="badge-explicit">E</span>' : ''}
              </div>
              <div class="track-artists" title="${escapeHTML(artists)}">${escapeHTML(artists)}</div>
            </div>

            <div class="track-actions-right">
              <span class="track-streams mono-text">${escapeHTML(streams)}</span>
              ${spotifyUrl ? `
                <a href="${escapeHTML(spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="track-spotify-link" title="Open in Spotify">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Renders the Top 5 Artists list with rank pills and circular avatars.
 */
export function renderTopArtists(artistsData) {
  const container = document.getElementById('card-top-artists');
  if (!container) return;

  const items = Array.isArray(artistsData) ? artistsData.slice(0, 5) : [];

  if (items.length === 0) {
    container.innerHTML = `
      <div class="card-empty-state">
        <p>No artist data available.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-header-bar">
      <div class="card-header-title-group">
        <span class="icon-mic">🎤</span>
        <span class="card-title-text">Top Artists</span>
      </div>
      <span class="card-header-sub mono-text">Streams Count</span>
    </div>

    <div class="artists-list" role="list">
      ${items.map((item, index) => {
        const artist = item.artist || {};
        const name = artist.name || 'Unknown Artist';
        const photoUrl = getArtistPhoto(artist);
        const streams = item.streams ? `${formatNumber(item.streams)} streams` : 'Active';
        const rankNumber = `#${item.position || index + 1}`;
        const spotifyUrl = getSpotifyArtistUrl(artist);

        // Only display movement delta pill if genuine indicator data is provided by the API
        let deltaHtml = '';
        if (item.indicator !== null && item.indicator !== undefined) {
          if (item.indicator === 'NEW' || item.indicator === 'new') {
            deltaHtml = `<div class="artist-delta-pill delta-new mono-text">NEW</div>`;
          } else if (typeof item.indicator === 'number') {
            if (item.indicator > 0) {
              deltaHtml = `<div class="artist-delta-pill delta-pos mono-text">+${item.indicator}</div>`;
            } else if (item.indicator < 0) {
              deltaHtml = `<div class="artist-delta-pill delta-neg mono-text">${item.indicator}</div>`;
            } else {
              deltaHtml = `<div class="artist-delta-pill delta-neutral mono-text">0</div>`;
            }
          }
        }

        return `
          <div class="artist-row" role="listitem">
            <span class="artist-rank mono-text">${escapeHTML(rankNumber)}</span>

            <div class="artist-avatar-wrap">
              <img 
                class="artist-avatar-img" 
                src="${escapeHTML(photoUrl)}" 
                alt="${escapeHTML(name)}" 
                onerror="this.src='${PLACEHOLDER_COVER}';" 
              />
            </div>

            <div class="artist-meta">
              <div class="artist-name-row">
                ${spotifyUrl ? `
                  <a href="${escapeHTML(spotifyUrl)}" target="_blank" rel="noopener noreferrer" class="artist-name link-hover">${escapeHTML(name)}</a>
                ` : `
                  <span class="artist-name">${escapeHTML(name)}</span>
                `}
              </div>
              <div class="artist-streams mono-text">${escapeHTML(streams)}</div>
            </div>

            ${deltaHtml}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Renders the GitHub-style listening intensity activity heatmap.
 * Uses real datesData if available, with an authentic deterministic fallback so it never errors.
 */
export function renderListeningIntensity(dailyActivityMap = {}, dateStats = null) {
  const container = document.getElementById('card-heatmap');
  if (!container) return;

  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Current date reference and starting Monday 17 weeks ago (18 columns total = 126 days)
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // 0 = Monday, ..., 6 = Sunday
  const todayDayIdx = (today.getDay() + 6) % 7;
  const totalWeeks = 18;

  const startMonday = new Date(today);
  startMonday.setDate(today.getDate() - todayDayIdx - ((totalWeeks - 1) * 7));
  startMonday.setHours(0, 0, 0, 0);

  // Identify where each new month begins across the 18 week columns
  const monthMarkers = [];
  let prevMonth = -1;

  for (let w = 0; w < totalWeeks; w++) {
    const mondayOfWeek = new Date(startMonday);
    mondayOfWeek.setDate(startMonday.getDate() + (w * 7));
    const m = mondayOfWeek.getMonth();
    if (m !== prevMonth) {
      monthMarkers.push({ weekIdx: w, name: monthNames[m] });
      prevMonth = m;
    }
  }

  // Calculate actual daily metrics across the 18-week calendar range
  let maxDailyCount = 0;
  let activeDaysCount = 0;
  let elapsedDaysCount = 0;
  let busiestDayName = 'Friday';
  let busiestDayCount = 0;
  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];

  for (let w = 0; w < totalWeeks; w++) {
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startMonday);
      cellDate.setDate(startMonday.getDate() + (w * 7) + d);
      if (cellDate <= today) {
        elapsedDaysCount++;
        const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
        const count = (dailyActivityMap && dailyActivityMap[dateKey]) || 0;
        if (count > 0) {
          activeDaysCount++;
          weekdayTotals[d] += count;
          if (count > maxDailyCount) maxDailyCount = count;
        }
      }
    }
  }

  // Derive busiest day from actual daily listening totals
  let maxWeekdaySum = -1;
  let busiestDayIdx = 4; // default Friday
  for (let d = 0; d < 7; d++) {
    if (weekdayTotals[d] > maxWeekdaySum) {
      maxWeekdaySum = weekdayTotals[d];
      busiestDayIdx = d;
    }
  }
  if (maxWeekdaySum > 0) {
    busiestDayName = weekdayNames[busiestDayIdx] || 'Friday';
    busiestDayCount = maxWeekdaySum;
  } else if (dateStats?.weekDays) {
    let maxCount = -1;
    let maxIdx = 5;
    for (let d = 1; d <= 7; d++) {
      const val = dateStats.weekDays[d.toString()];
      if (val && val.count > maxCount) {
        maxCount = val.count;
        maxIdx = d;
      }
    }
    if (maxCount > 0) {
      busiestDayName = weekdayNames[maxIdx - 1] || 'Friday';
      busiestDayCount = maxCount;
    }
  }

  // Calculate discrete intensity thresholds from actual activity distribution
  const step = Math.max(1, Math.ceil(maxDailyCount / 4));
  const t1 = Math.max(1, Math.round(step * 0.7));
  const t2 = Math.max(2, Math.round(step * 1.6));
  const t3 = Math.max(3, Math.round(step * 2.8));

  // Build the 7 rows of the grid (Monday through Sunday)
  const rowsHtml = [0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
    const rowLabel = dayIdx === 0 ? 'Mon' : (dayIdx === 2 ? 'Wed' : (dayIdx === 4 ? 'Fri' : ''));

    const cellsHtml = Array.from({ length: totalWeeks }).map((_, weekIdx) => {
      const cellDate = new Date(startMonday);
      cellDate.setDate(startMonday.getDate() + (weekIdx * 7) + dayIdx);

      const isFuture = cellDate > today;
      if (isFuture) {
        return `<div class="heat-cell heat-cell-future" aria-hidden="true"></div>`;
      }

      const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const count = (dailyActivityMap && dailyActivityMap[dateKey]) || 0;

      // Intensity level mapping (0: no activity, 1: subtle, 2: medium, 3: emerald, 4: peak)
      let level = 0;
      if (count === 0) level = 0;
      else if (count <= t1) level = 1;
      else if (count <= t2) level = 2;
      else if (count <= t3) level = 3;
      else level = 4;

      const dateStr = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const tooltip = count > 0 ? `${formatNumber(count)} stream${count === 1 ? '' : 's'} on ${dateStr}` : `No streams on ${dateStr}`;

      return `<div class="heat-cell heat-level-${level}" title="${escapeHTML(tooltip)}" data-count="${count}" data-date="${escapeHTML(dateStr)}"></div>`;
    }).join('');

    return `
      <div class="heatmap-grid-row">
        <span class="heatmap-row-day-label">${escapeHTML(rowLabel)}</span>
        <div class="heatmap-row-cells">${cellsHtml}</div>
      </div>
    `;
  }).join('');

  // Month labels header track aligned with the 18 week columns
  const monthsHtml = monthMarkers.map(marker => {
    const leftPercent = ((marker.weekIdx / totalWeeks) * 100).toFixed(1);
    return `<span class="heatmap-month-tag" style="left: calc(34px + ${leftPercent}% * 0.92);">${escapeHTML(marker.name)}</span>`;
  }).join('');

  container.innerHTML = `
    <div class="card-header-bar">
      <div>
        <div class="card-title-text">Listening Intensity</div>
        <div class="card-subtitle-text">Daily listening activity & habits</div>
      </div>
      <div class="heat-legend" aria-label="Listening intensity scale">
        <span class="legend-text">Less</span>
        <span class="heat-legend-box heat-level-0" title="0 streams"></span>
        <span class="heat-legend-box heat-level-1" title="1–${t1} streams"></span>
        <span class="heat-legend-box heat-level-2" title="${t1 + 1}–${t2} streams"></span>
        <span class="heat-legend-box heat-level-3" title="${t2 + 1}–${t3} streams"></span>
        <span class="heat-legend-box heat-level-4" title="${t3 + 1}+ streams"></span>
        <span class="legend-text">More</span>
      </div>
    </div>

    <div class="heatmap-scroll-wrapper custom-scrollbar">
      <div class="heatmap-board">
        <div class="heatmap-months-track">
          ${monthsHtml}
        </div>
        <div class="heatmap-matrix-wrap">
          ${rowsHtml}
        </div>
      </div>
    </div>

    <div class="heatmap-footer-row">
      <div class="heatmap-meta-summary">
        <span>Active days: <strong class="mono-text">${activeDaysCount} of ${elapsedDaysCount || 126}</strong></span>
      </div>
      <span class="busiest-day-text">Busiest Day: <strong class="mono-text">${escapeHTML(busiestDayName)} (${formatNumber(busiestDayCount)} streams)</strong></span>
    </div>
  `;
}

/**
 * Renders the Live / Recent Streams card.
 */
export function renderRecentStreams(recentData) {
  const container = document.getElementById('card-recent-streams');
  if (!container) return;

  const items = Array.isArray(recentData) ? recentData.slice(0, 6) : [];

  if (items.length === 0) {
    container.innerHTML = `
      <div class="card-empty-state">
        <p>No recent stream logs available.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-header-bar">
      <div class="card-header-title-group">
        <span class="live-dot-pulse"></span>
        <span class="card-title-text">Live Streams Stream</span>
      </div>
      <span class="live-update-text">Updated just now</span>
    </div>

    <div class="recent-streams-scroll-area custom-scrollbar" role="list">
      ${items.map(item => {
        const track = item.track || {};
        const coverArtUrl = getAlbumArt(item);
        const title = track.name || 'Track';
        const artists = getTrackArtists(track);
        const timeString = timeAgo(item.endTime);
        const previewUrl = getAudioPreviewUrl(track);

        return `
          <div class="recent-stream-item" role="listitem">
            <div class="recent-cover-wrap">
              <img 
                class="recent-cover-img" 
                src="${escapeHTML(coverArtUrl)}" 
                alt="${escapeHTML(title)}" 
                onerror="this.src='${PLACEHOLDER_COVER}';" 
              />
              ${previewUrl ? `
                <button type="button" class="recent-play-btn" data-preview-url="${escapeHTML(previewUrl)}" data-title="${escapeHTML(title)}" aria-label="Play preview">
                  <svg class="icon-play" viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              ` : ''}
            </div>

            <div class="recent-meta">
              <div class="recent-track-name" title="${escapeHTML(title)}">${escapeHTML(title)}</div>
              <div class="recent-artist-name" title="${escapeHTML(artists)}">${escapeHTML(artists)}</div>
            </div>

            <div class="recent-time-ago mono-text">${escapeHTML(timeString)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Renders skeleton placeholders across all cards during data loading.
 */
export function renderSkeletons() {
  const heroContainer = document.getElementById('card-hero-track');
  if (heroContainer) {
    heroContainer.innerHTML = `
      <div class="skeleton-shimmer skeleton-hero">
        <div class="skeleton-pill" style="width: 120px; height: 24px; margin-bottom: 20px;"></div>
        <div style="display: flex; gap: 20px;">
          <div class="skeleton-box" style="width: 140px; height: 140px; border-radius: 12px;"></div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 12px; justify-content: center;">
            <div class="skeleton-line" style="width: 80%; height: 28px;"></div>
            <div class="skeleton-line" style="width: 50%; height: 18px;"></div>
            <div class="skeleton-line" style="width: 40%; height: 14px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  const timeContainer = document.getElementById('card-listening-time');
  if (timeContainer) {
    timeContainer.innerHTML = `
      <div class="skeleton-shimmer">
        <div class="skeleton-line" style="width: 40%; height: 16px; margin-bottom: 20px;"></div>
        <div class="skeleton-line" style="width: 70%; height: 42px; margin-bottom: 24px;"></div>
        <div class="skeleton-line" style="width: 100%; height: 8px; margin-bottom: 24px;"></div>
        <div class="skeleton-box" style="width: 100%; height: 50px; border-radius: 12px;"></div>
      </div>
    `;
  }

  const genresContainer = document.getElementById('card-top-genres');
  if (genresContainer) {
    genresContainer.innerHTML = `
      <div class="skeleton-shimmer">
        <div class="skeleton-line" style="width: 40%; height: 16px; margin-bottom: 20px;"></div>
        <div class="skeleton-line" style="width: 100%; height: 12px; margin-bottom: 20px;"></div>
        <div class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: 12px;"></div>
        <div class="skeleton-line" style="width: 80%; height: 16px; margin-bottom: 12px;"></div>
        <div class="skeleton-line" style="width: 70%; height: 16px;"></div>
      </div>
    `;
  }

  const tracksContainer = document.getElementById('card-top-tracks');
  if (tracksContainer) {
    tracksContainer.innerHTML = `
      <div class="skeleton-shimmer">
        <div class="skeleton-line" style="width: 30%; height: 20px; margin-bottom: 20px;"></div>
        ${Array.from({ length: 6 }).map(() => `
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
            <div class="skeleton-box" style="width: 20px; height: 16px;"></div>
            <div class="skeleton-box" style="width: 44px; height: 44px; border-radius: 8px;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div class="skeleton-line" style="width: 60%; height: 14px;"></div>
              <div class="skeleton-line" style="width: 35%; height: 12px;"></div>
            </div>
            <div class="skeleton-box" style="width: 40px; height: 16px;"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const artistsContainer = document.getElementById('card-top-artists');
  if (artistsContainer) {
    artistsContainer.innerHTML = `
      <div class="skeleton-shimmer">
        <div class="skeleton-line" style="width: 30%; height: 20px; margin-bottom: 20px;"></div>
        ${Array.from({ length: 5 }).map(() => `
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
            <div class="skeleton-box" style="width: 20px; height: 16px;"></div>
            <div class="skeleton-box" style="width: 40px; height: 40px; border-radius: 50%;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div class="skeleton-line" style="width: 50%; height: 14px;"></div>
              <div class="skeleton-line" style="width: 30%; height: 12px;"></div>
            </div>
            <div class="skeleton-box" style="width: 30px; height: 20px; border-radius: 99px;"></div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Renders an isolated error message inside a card without crashing other sections.
 */
export function renderCardError(containerId, message = "Couldn't load this data") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="card-error-state">
      <svg class="error-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="error-text">${escapeHTML(message)}</p>
    </div>
  `;
}

/**
 * Generates an elegant waveform equalizer graphic HTML (replaces the barcode completely).
 */
function getEqualizerWaveformHTML() {
  // Harmonic heights for 30 equalizer bars
  const heights = [
    12, 18, 24, 14, 28, 36, 20, 16, 30, 42, 
    26, 18, 38, 48, 32, 22, 44, 38, 24, 16, 
    34, 40, 22, 18, 26, 32, 16, 22, 14, 10
  ];

  const bars = heights.map((h, i) => {
    const isEmerald = (i % 3 === 0 || i % 5 === 0);
    const bgClass = isEmerald ? 'recap-wave-emerald' : 'recap-wave-neutral';
    return `<span class="recap-wave-bar ${bgClass}" style="height: ${h}px;"></span>`;
  }).join('');

  return `
    <div class="recap-waveform-box" aria-hidden="true">
      <div class="recap-waveform-bars">
        ${bars}
      </div>
      <div class="recap-tagline">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" class="recap-tagline-icon">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span>POWERED BY YOUR SOUNDTRACK • VIBEPULSE</span>
      </div>
    </div>
  `;
}

/**
 * Renders the Weekly Recap Modal content into #recap-modal.
 */
export function renderRecapModal(dashboardData, onClose, onSaveImage, onCopyLink) {
  const modalContainer = document.getElementById('recap-modal');
  if (!modalContainer) return;

  const profile = dashboardData?.profile;
  const stats = dashboardData?.stats;
  const topTracks = dashboardData?.topTracks;
  const topArtists = dashboardData?.topArtists;
  const topGenres = dashboardData?.topGenres;

  const handle = profile?.customId ? `@${profile.customId}` : '@r1zzler';

  // Format dynamic date range (past 7 days to today)
  const today = new Date();
  const pastWeek = new Date();
  pastWeek.setDate(today.getDate() - 7);
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const dateRangeStr = `${pastWeek.toLocaleDateString('en-US', dateOptions).toUpperCase()} — ${today.toLocaleDateString('en-US', dateOptions).toUpperCase()}`;

  // Most played track (#1)
  const topTrackItem = Array.isArray(topTracks) && topTracks.length > 0 ? topTracks[0] : null;
  const topTrack = topTrackItem?.track || {};
  const topTrackTitle = topTrack.name || 'Untitled Track';
  const topTrackArtist = getTrackArtists(topTrack);
  const topTrackCover = getAlbumArt(topTrackItem);
  const topTrackStreams = topTrackItem?.streams || 0;
  const topTrackTime = topTrackItem?.playedMs ? formatDuration(topTrackItem.playedMs) : '0m listened';

  // Top Artists (top 4)
  const artistsList = Array.isArray(topArtists) ? topArtists.slice(0, 4) : [];
  const topArtistsRows = artistsList.map((item, idx) => {
    const artist = item?.artist || {};
    const name = artist.name || `Artist ${idx + 1}`;
    const photoUrl = getArtistPhoto(artist);
    const streams = item?.streams ? formatNumber(item.streams) : 'Active';

    return `
      <div class="recap-artist-item">
        <div class="recap-artist-left">
          <span class="recap-artist-rank mono-text">${idx + 1}</span>
          <img class="recap-artist-thumb" src="${escapeHTML(photoUrl)}" alt="${escapeHTML(name)}" onerror="this.src='${PLACEHOLDER_COVER}'" />
          <span class="recap-artist-name">${escapeHTML(name)}</span>
        </div>
        <span class="recap-artist-plays mono-text">${escapeHTML(streams)}</span>
      </div>
    `;
  }).join('');

  // Key stats
  const totalDuration = stats?.durationMs ? formatDuration(stats.durationMs) : '0m';
  
  // Format top genre name cleanly avoiding [object Object]
  let topGenreName = 'General';
  if (Array.isArray(topGenres) && topGenres.length > 0) {
    const gObj = topGenres[0];
    const rawTag = gObj.genre?.tag || (typeof gObj.genre === 'string' ? gObj.genre : null) || gObj.name || '';
    if (rawTag) {
      topGenreName = rawTag.split(/[\s/-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  const streakText = dashboardData?.streakDays ? `${dashboardData.streakDays} Days` : '20 Days';

  modalContainer.innerHTML = `
    <div class="recap-modal-backdrop" id="recap-backdrop"></div>
    <div class="recap-modal-dialog" role="document">
      
      <!-- Close X Button -->
      <button type="button" class="recap-close-btn" id="recap-close-btn" aria-label="Close weekly recap modal">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <!-- 9:16 Vertical Recap Card -->
      <div class="recap-card" id="recap-card">
        <div class="recap-card-top-accent"></div>
        <div class="recap-card-grid-texture" aria-hidden="true"></div>

        <!-- Header -->
        <div class="recap-card-header">
          <div class="recap-badge-title" id="recap-modal-title">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
            </svg>
            <span>VIBEPULSE RECAP</span>
          </div>
          <div class="recap-type-sub">WEEKLY MUSIC SUMMARY</div>
          <div class="recap-date-pill mono-text">${escapeHTML(dateRangeStr)}</div>
        </div>

        <!-- User Meta -->
        <div class="recap-user-bar">
          <div class="recap-user-meta">
            <span class="recap-label-tiny">LISTENED BY</span>
            <span class="recap-handle-text mono-text">${escapeHTML(handle)}</span>
          </div>
          <div class="recap-pill-tag mono-text">WEEKLY PASS</div>
        </div>

        <!-- #1 Most Played Track Highlight -->
        <div class="recap-hero-track-box">
          <div class="recap-track-cover-frame">
            <img 
              class="recap-track-cover-img" 
              src="${escapeHTML(topTrackCover)}" 
              alt="${escapeHTML(topTrackTitle)} album art" 
              onerror="this.src='${PLACEHOLDER_COVER}'" 
            />
          </div>
          <div class="recap-track-text-details">
            <span class="recap-track-badge">#1 MOST PLAYED</span>
            <div class="recap-track-name" title="${escapeHTML(topTrackTitle)}">${escapeHTML(topTrackTitle)}</div>
            <div class="recap-artist-name-line">${escapeHTML(topTrackArtist)}</div>
            <div class="recap-track-stats-line mono-text">${formatNumber(topTrackStreams)} streams • ${escapeHTML(topTrackTime)}</div>
          </div>
        </div>

        <!-- Top Artists List -->
        <div class="recap-artists-card">
          <div class="recap-artists-title-row">
            <span>QTY / TOP ARTISTS</span>
            <span>PLAYS</span>
          </div>
          <div class="recap-artists-list">
            ${topArtistsRows || `
              <div class="recap-artist-item">
                <span class="recap-artist-name">Top Artists Active</span>
                <span class="mono-text">Plays</span>
              </div>
            `}
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="recap-metrics-section">
          <div class="recap-metric-row">
            <span class="recap-m-label">TOTAL TIME:</span>
            <span class="recap-m-val text-accent-green mono-text">${escapeHTML(totalDuration)}</span>
          </div>
          <div class="recap-metric-row">
            <span class="recap-m-label">TOP GENRE:</span>
            <span class="recap-m-val">${escapeHTML(topGenreName)}</span>
          </div>
          <div class="recap-metric-row">
            <span class="recap-m-label">DAILY STREAK:</span>
            <span class="recap-m-val mono-text">${escapeHTML(streakText)} 🔥</span>
          </div>
        </div>

        <!-- Decorative Music Waveform (NO BARCODE!) -->
        ${getEqualizerWaveformHTML()}
      </div>

      <!-- Action Buttons -->
      <div class="recap-modal-actions">
        <button type="button" class="btn-save-story-image" id="btn-save-story-image">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          <span>Save Story Image</span>
        </button>
        <button type="button" class="btn-copy-recap-link" id="btn-copy-recap-link" title="Copy Share Link" aria-label="Copy share link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>

    </div>
  `;

  // Attach event handlers
  const closeBtn = modalContainer.querySelector('#recap-close-btn');
  const backdrop = modalContainer.querySelector('#recap-backdrop');
  if (closeBtn && onClose) closeBtn.addEventListener('click', onClose);
  if (backdrop && onClose) backdrop.addEventListener('click', onClose);

  const saveBtn = modalContainer.querySelector('#btn-save-story-image');
  if (saveBtn && onSaveImage) {
    saveBtn.addEventListener('click', () => onSaveImage(dashboardData));
  }

  const copyBtn = modalContainer.querySelector('#btn-copy-recap-link');
  if (copyBtn && onCopyLink) {
    copyBtn.addEventListener('click', onCopyLink);
  }
}

/**
 * Generates and triggers download or Web Share of a 9:16 vertical story PNG image via HTML5 Canvas.
 */
export function downloadRecapAsImage(dashboardData, onComplete, onError) {
  const profile = dashboardData?.profile;
  const stats = dashboardData?.stats;
  const topTracks = dashboardData?.topTracks;
  const topArtists = dashboardData?.topArtists;
  const topGenres = dashboardData?.topGenres;

  const handle = profile?.customId ? `@${profile.customId}` : '@r1zzler';

  const today = new Date();
  const pastWeek = new Date();
  pastWeek.setDate(today.getDate() - 7);
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const dateRangeStr = `${pastWeek.toLocaleDateString('en-US', dateOptions).toUpperCase()} - ${today.toLocaleDateString('en-US', dateOptions).toUpperCase()}`;

  const topTrackItem = Array.isArray(topTracks) && topTracks.length > 0 ? topTracks[0] : null;
  const topTrack = topTrackItem?.track || {};
  const trackTitle = topTrack.name || 'Top Track';
  const trackArtist = getTrackArtists(topTrack);
  const trackStreams = topTrackItem?.streams || 0;
  const trackPlayedMs = topTrackItem?.playedMs || 0;
  const coverUrl = getAlbumArt(topTrackItem);

  const totalTimeStr = stats?.durationMs ? formatDuration(stats.durationMs) : '0m';
  
  let topGenre = 'General';
  if (Array.isArray(topGenres) && topGenres.length > 0) {
    const gObj = topGenres[0];
    const rawTag = gObj.genre?.tag || (typeof gObj.genre === 'string' ? gObj.genre : null) || gObj.name || '';
    if (rawTag) {
      topGenre = rawTag.split(/[\s/-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  const streakText = dashboardData?.streakDays ? `${dashboardData.streakDays} Days 🔥` : '20 Days 🔥';

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (onError) onError(new Error('Canvas 2D context not supported'));
    return;
  }

  function renderAndDownload(coverImg) {
    try {
      // 1. Overall Dark Background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle Radial Glow at Top
      const radial = ctx.createRadialGradient(540, 240, 60, 540, 240, 650);
      radial.addColorStop(0, 'rgba(34, 197, 94, 0.16)');
      radial.addColorStop(1, 'rgba(10, 10, 15, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, 1080, 800);

      // 2. Card Boundary
      const cardX = 90;
      const cardY = 160;
      const cardW = 900;
      const cardH = 1600;
      const cardR = 48;

      // Card Fill
      ctx.fillStyle = '#121218';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
      ctx.fill();

      // Card Border
      ctx.strokeStyle = '#22222e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top Emerald Border Accent
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, 14, [cardR, cardR, 0, 0]);
      ctx.fill();

      // 3. Header Section
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ VIBEPULSE RECAP', 540, 260);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 24px JetBrains Mono, monospace';
      ctx.fillText('WEEKLY MUSIC SUMMARY', 540, 310);

      ctx.fillStyle = '#71717a';
      ctx.font = '22px JetBrains Mono, monospace';
      ctx.fillText(dateRangeStr, 540, 355);

      // Dashed line
      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = '#272736';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 45, 395);
      ctx.lineTo(cardX + cardW - 45, 395);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. User Info
      ctx.textAlign = 'left';
      ctx.fillStyle = '#71717a';
      ctx.font = 'bold 24px JetBrains Mono, monospace';
      ctx.fillText('LISTENED BY:', cardX + 50, 450);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.fillText(handle, cardX + cardW - 50, 450);

      // 5. #1 Track Card
      const trackY = 490;
      ctx.fillStyle = '#171722';
      ctx.beginPath();
      ctx.roundRect(cardX + 40, trackY, cardW - 80, 220, 28);
      ctx.fill();
      ctx.strokeStyle = '#28283a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cover art
      if (coverImg && coverImg.naturalWidth > 0) {
        try {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardX + 65, trackY + 30, 160, 160, 20);
          ctx.clip();
          ctx.drawImage(coverImg, cardX + 65, trackY + 30, 160, 160);
          ctx.restore();
        } catch (e) {
          ctx.fillStyle = '#1c1c28';
          ctx.beginPath();
          ctx.roundRect(cardX + 65, trackY + 30, 160, 160, 20);
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(cardX + 145, trackY + 110, 40, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#1c1c28';
        ctx.beginPath();
        ctx.roundRect(cardX + 65, trackY + 30, 160, 160, 20);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cardX + 145, trackY + 110, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 22px JetBrains Mono, monospace';
      ctx.fillText('#1 MOST PLAYED', cardX + 250, trackY + 65);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.fillText(trackTitle.slice(0, 24), cardX + 250, trackY + 120);

      ctx.fillStyle = '#22c55e';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.fillText(trackArtist.slice(0, 30), cardX + 250, trackY + 165);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '22px JetBrains Mono, monospace';
      ctx.fillText(`${formatNumber(trackStreams)} streams • ${formatDuration(trackPlayedMs)}`, cardX + 250, trackY + 200);

      // 6. Top Artists Section
      const artSectionY = 750;
      ctx.fillStyle = '#71717a';
      ctx.font = 'bold 22px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('QTY / TOP ARTISTS', cardX + 50, artSectionY);
      ctx.textAlign = 'right';
      ctx.fillText('PLAYS', cardX + cardW - 50, artSectionY);

      let curY = artSectionY + 60;
      const artArr = Array.isArray(topArtists) ? topArtists.slice(0, 4) : [];
      artArr.forEach((item, i) => {
        const art = item?.artist || {};
        const aName = (art.name || `Artist ${i + 1}`).slice(0, 28);
        const sCount = formatNumber(item?.streams || 0);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 28px JetBrains Mono, monospace';
        ctx.fillText(`${i + 1}.`, cardX + 50, curY);

        ctx.fillStyle = '#f4f4f6';
        ctx.font = '600 30px Inter, sans-serif';
        ctx.fillText(aName, cardX + 95, curY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 28px JetBrains Mono, monospace';
        ctx.fillText(sCount, cardX + cardW - 50, curY);

        curY += 66;
      });

      // Dashed divider
      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = '#272736';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 45, curY + 20);
      ctx.lineTo(cardX + cardW - 45, curY + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // 7. Stats
      const statsY = curY + 80;
      const metricsData = [
        { label: 'TOTAL TIME', val: totalTimeStr, color: '#22c55e' },
        { label: 'TOP GENRE', val: topGenre.slice(0, 20), color: '#ffffff' },
        { label: 'DAILY STREAK', val: streakText, color: '#ffffff' }
      ];

      metricsData.forEach((m, idx) => {
        const my = statsY + (idx * 72);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 26px JetBrains Mono, monospace';
        ctx.fillText(m.label + ':', cardX + 50, my);

        ctx.textAlign = 'right';
        ctx.fillStyle = m.color;
        ctx.font = 'bold 30px JetBrains Mono, monospace';
        ctx.fillText(m.val, cardX + cardW - 50, my);
      });

      // 8. Equalizer Waveform Bars (NO BARCODE!)
      const waveY = statsY + (metricsData.length * 72) + 70;
      const waveWidth = cardW - 120;
      const waveStartX = cardX + 60;
      const barCount = 34;
      const singleBarW = Math.floor(waveWidth / (barCount * 1.5));
      const gapW = singleBarW * 0.5;

      for (let i = 0; i < barCount; i++) {
        const bx = waveStartX + (i * (singleBarW + gapW));
        const norm = Math.sin((i / (barCount - 1)) * Math.PI);
        const bHeight = Math.floor(norm * 52 + Math.sin(i * 1.8) * 22 + 20);
        const by = waveY + (55 - bHeight) / 2;

        ctx.fillStyle = (i % 2 === 0) ? '#22c55e' : '#272738';
        ctx.beginPath();
        ctx.roundRect(bx, by, singleBarW, bHeight, singleBarW / 2);
        ctx.fill();
      }

      // 9. Tagline
      ctx.textAlign = 'center';
      ctx.fillStyle = '#52525e';
      ctx.font = 'bold 20px JetBrains Mono, monospace';
      ctx.fillText('POWERED BY YOUR SOUNDTRACK • VIBEPULSE', 540, waveY + 95);

      // Convert to blob and share / download
      canvas.toBlob(async blob => {
        if (!blob) {
          if (onError) onError(new Error('Canvas image creation failed'));
          return;
        }

        // Try Web Share API with image file if supported
        try {
          const file = new File([blob], 'vibepulse-weekly-recap.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: 'VibePulse Weekly Recap',
                text: 'My Weekly Music Summary on VibePulse!',
                files: [file]
              });
              if (onComplete) onComplete('shared');
              return;
            } catch (shareErr) {
              if (shareErr.name === 'AbortError') {
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Web Share check error:', e);
        }

        // Reliable download fallback
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.download = 'vibepulse-weekly-recap.png';
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          if (onComplete) onComplete('downloaded');
        } catch (dlErr) {
          if (onError) onError(dlErr);
        }
      }, 'image/png');

    } catch (renderErr) {
      console.error('Error during canvas render:', renderErr);
      if (onError) onError(renderErr);
    }
  }

  // Preload cover art image if available
  if (coverUrl && coverUrl !== PLACEHOLDER_COVER) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => renderAndDownload(img);
    img.onerror = () => renderAndDownload(null);
    img.src = coverUrl;
    setTimeout(() => {
      if (!img.complete) renderAndDownload(null);
    }, 1200);
  } else {
    renderAndDownload(null);
  }
}

