/**
 * stats.fm API Client with LocalStorage 5-minute TTL caching and robust error handling.
 */

import { BASE_URL, CACHE_TTL_MS } from './config.js';

/**
 * Fetches data from a URL with localStorage caching.
 * @param {string} url - Target API URL
 * @param {boolean} forceRefresh - If true, bypasses the cache
 * @returns {Promise<any>}
 */
export async function fetchWithCache(url, forceRefresh = false) {
  const cacheKey = `statsfm_cache_${url}`;
  const now = Date.now();

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && now - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
  }

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${response.statusText} (${errorText || 'Failed to fetch'})`);
  }

  const data = await response.json();

  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: now,
      data
    }));
  } catch (e) {
    console.warn('LocalStorage write error (quota exceeded or private mode):', e);
  }

  return data;
}

/**
 * Fetches the user's public stats.fm profile.
 */
export async function fetchUserProfile(username, force = false) {
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}`;
  const json = await fetchWithCache(url, force);
  return json?.item || null;
}

/**
 * Fetches the top tracks for the given range preset.
 * Limit defaults to 10 as specified in plan.md.
 */
export async function fetchTopTracks(username, rangeParams, limit = 10, force = false) {
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}/top/tracks?${rangeParams}&limit=${limit}`;
  const json = await fetchWithCache(url, force);
  return json?.items || [];
}

/**
 * Fetches top 5 artists.
 */
export async function fetchTopArtists(username, rangeParams, limit = 5, force = false) {
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}/top/artists?${rangeParams}&limit=${limit}`;
  const json = await fetchWithCache(url, force);
  return json?.items || [];
}

/**
 * Fetches top 5 genres with stream breakdown.
 */
export async function fetchTopGenres(username, rangeParams, limit = 5, force = false) {
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}/top/genres?${rangeParams}&limit=${limit}`;
  const json = await fetchWithCache(url, force);
  return json?.items || [];
}

/**
 * Fetches overall stream stats (total count, durationMs, percentiles, cardinality).
 */
export async function fetchStreamStats(username, rangeParams, force = false) {
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}/streams/stats?${rangeParams}`;
  const json = await fetchWithCache(url, force);
  return json?.items || null;
}

/**
 * Fetches recently played tracks.
 */
export async function fetchRecentStreams(username, limit = 10, force = false) {
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}/streams/recent?limit=${limit}`;
  const json = await fetchWithCache(url, force);
  return json?.items || [];
}

/**
 * Fetches hourly and weekday distribution stats for listening intensity heatmap.
 */
export async function fetchDateStats(username, rangeParams, force = false) {
  // stats.fm API expects timeZoneOffset in integer hours (-12 to +14), not minutes
  const tzOffsetHours = Math.round((new Date().getTimezoneOffset() * -1) / 60);
  const url = `${BASE_URL}/users/${encodeURIComponent(username)}/streams/stats/dates?${rangeParams}&timeZoneOffset=${tzOffsetHours}`;
  try {
    const json = await fetchWithCache(url, force);
    return json?.items || null;
  } catch (e) {
    console.warn('dateStats fetch failed, will use fallback listening activity data:', e);
    return null;
  }
}

