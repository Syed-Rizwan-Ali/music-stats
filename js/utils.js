/**
 * Utility functions for formatting, sanitizing, and asset retrieval.
 */

import { PLACEHOLDER_COVER } from './config.js';

/**
 * Formats milliseconds into a human-readable duration like "34h 12m" or "4m 15s".
 * @param {number} ms - Milliseconds
 * @param {boolean} short - Whether to format as compact mm:ss for track rows
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms, short = false) {
  if (typeof ms !== 'number' || isNaN(ms) || ms <= 0) return short ? '0:00' : '0m';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (short) {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Returns a human-friendly relative time string (e.g., "2 mins ago", "1 hour ago").
 * @param {string|number|Date} dateInput
 * @returns {string}
 */
export function timeAgo(dateInput) {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`;
}

/**
 * Safe accessor for album cover URL as strictly specified in plan.md Section 4.2:
 * item.track.albums[0].image
 * Handles optional chaining, non-empty validation, and default placeholder fallback.
 * @param {object} item - Top track or stream item
 * @returns {string} Image URL
 */
export function getAlbumArt(item) {
  if (!item) return PLACEHOLDER_COVER;
  const track = item.track || item;
  const albumImage = track?.albums?.[0]?.image;
  if (albumImage && typeof albumImage === 'string' && albumImage.trim().length > 0) {
    return albumImage.trim();
  }
  return PLACEHOLDER_COVER;
}

/**
 * Safe accessor for artist image.
 * @param {object} artist
 * @returns {string} Image URL
 */
export function getArtistPhoto(artist) {
  const image = artist?.image;
  if (image && typeof image === 'string' && image.trim().length > 0) {
    return image.trim();
  }
  return PLACEHOLDER_COVER;
}

/**
 * Joins all artist names with commas.
 * @param {object} track
 * @returns {string}
 */
export function getTrackArtists(track) {
  if (!track?.artists || !Array.isArray(track.artists) || track.artists.length === 0) {
    return 'Unknown Artist';
  }
  return track.artists.map(a => a?.name || 'Unknown').filter(Boolean).join(', ');
}

/**
 * Formats a number with comma grouping (e.g. 14892 -> "14,892").
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Returns Spotify track link if available.
 * @param {object} track
 * @returns {string}
 */
export function getSpotifyTrackUrl(track) {
  const spotifyId = track?.externalIds?.spotify?.[0];
  if (spotifyId && typeof spotifyId === 'string' && spotifyId.trim().length > 0) {
    return `https://open.spotify.com/track/${encodeURIComponent(spotifyId.trim())}`;
  }
  return null;
}

/**
 * Returns Spotify artist link if available.
 * @param {object} artist
 * @returns {string}
 */
export function getSpotifyArtistUrl(artist) {
  const spotifyId = artist?.externalIds?.spotify?.[0];
  if (spotifyId && typeof spotifyId === 'string' && spotifyId.trim().length > 0) {
    return `https://open.spotify.com/artist/${encodeURIComponent(spotifyId.trim())}`;
  }
  return null;
}

/**
 * Returns playable audio preview URL if present (Spotify or Apple Music 30s preview).
 * @param {object} track
 * @returns {string|null}
 */
export function getAudioPreviewUrl(track) {
  if (track?.spotifyPreview && typeof track.spotifyPreview === 'string') {
    return track.spotifyPreview;
  }
  if (track?.appleMusicPreview && typeof track.appleMusicPreview === 'string') {
    return track.appleMusicPreview;
  }
  return null;
}
