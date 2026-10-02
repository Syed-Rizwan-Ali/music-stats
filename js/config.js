/**
 * Application Configuration
 * All global constants and endpoint presets.
 */

// Target stats.fm username - change this ONE constant to display another profile
export const USERNAME = 'r1zzler';

// stats.fm public API base URL
export const BASE_URL = 'https://api.stats.fm/api/v1';

// Client-side cache TTL (5 minutes in milliseconds)
export const CACHE_TTL_MS = 5 * 60 * 1000;

// Asset fallbacks
export const PLACEHOLDER_COVER = 'assets/placeholder-cover.svg';

// Range filter presets
export const RANGE_PRESETS = {
  'this-week': {
    id: 'this-week',
    label: 'This Week',
    params: 'range=weeks&range_value=1',
    daysCount: 7
  },
  'last-30-days': {
    id: 'last-30-days',
    label: 'Last 30 Days',
    params: 'range=months&range_value=1',
    daysCount: 30
  },
  'all-time': {
    id: 'all-time',
    label: 'All Time',
    params: 'range=lifetime',
    daysCount: null
  }
};

export const DEFAULT_RANGE = 'this-week';
