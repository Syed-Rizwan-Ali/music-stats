# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain HTML5 + CSS3 (custom properties / design tokens) + vanilla JavaScript (ES modules). Zero build step, static hosting ready (Live Server, GitHub Pages, Vercel, Netlify).

## Users

Primary user: `r1zzler` (personal Spotify listener).
Secondary users: Friends, followers, and music enthusiasts visiting the shared personal link to explore listening habits, favorite tracks, and top artists.

## Product Purpose

A personal listening stats dashboard displaying Spotify listening data pulled directly from the public stats.fm API. It provides a visual, real-time snapshot of top tracks, artists, genres, listening duration, and habits with zero login friction, read-only security, and instant shareability.

## Positioning

Unlike generic or raw data tables, this dashboard delivers an editorial, high-craft "bento grid" listening recap inspired by modern vinyl aesthetics and streaming analytics. It bridges stats.fm API data with a dark-mode experience featuring authentic album art, vinyl sleeve presentation, live audio snippets, and rich responsiveness.

## Operating Context

Modern desktop and mobile web browsers. Used casually to review personal music taste, track listening milestones, or share music recaps on social platforms or group chats. Runs entirely client-side with 5-minute localStorage caching to respect API limits.

## Capabilities and Constraints

- Public stats.fm API base: `https://api.stats.fm/api/v1`
- Target username: `r1zzler` (isolated in single config constant `js/config.js` for quick switching)
- Read-only, client-side requests with native browser CORS
- Range presets: This Week (`range=weeks&range_value=1`), Last 30 Days (`range=months&range_value=1`), All Time (`range=lifetime`)
- Top 10 tracks featuring real album artwork (`item.track.albums[0].image`) with fallback placeholder
- Top Artists (5), Top Genres (with distribution bar), Listening Time, and Recent Streams
- Real listening intensity metrics derived from `/users/r1zzler/streams/stats/dates`
- No backend, no Spotify OAuth required, no API key required for public profiles
- Terminology: "streams" or "plays" (not Last.fm "scrobbles")
- Graceful degradation: independent card loading with isolated error boundaries

## Brand Commitments

- Visual World: Dark "bento grid" dashboard matching the VibePulse aesthetic
- Background: `#0a0a0b` deep dark neutral
- Card Surface: `#111115` with `#1d1d24` subtle 1px border and 16px radius
- Brand Accent: `#22c55e` (vibrant emerald / stats.fm green)
- Typography: Inter (UI & typography) + JetBrains Mono (numbers, metrics, timestamps, badges)
- Iconic Motif: Hero Top Track featuring a realistic vinyl record sliding out from the album sleeve

## Evidence on Hand

- Verified endpoints: `GET /users/r1zzler/top/tracks` (contains real cover images and 30s preview URLs)
- Profile endpoint: `GET /users/r1zzler`
- Top artists: `GET /users/r1zzler/top/artists`
- Top genres: `GET /users/r1zzler/top/genres`
- Stream stats: `GET /users/r1zzler/streams/stats`
- Stream dates & intensity: `GET /users/r1zzler/streams/stats/dates?timeZoneOffset=0`
- Recent streams: `GET /users/r1zzler/streams/recent?limit=10`
- Reference design: VibePulse bento grid screenshot

## Product Principles

1. **Authentic Data, Zero Fabricated Placeholders:** Display real cover art and live data; fall back gracefully to elegant defaults when fields are absent.
2. **Resilience Through Isolation:** Each card fetches and renders independently via `Promise.allSettled`; failure of one endpoint never degrades the rest of the dashboard.
3. **Speed & Efficiency:** Instant UI response with client-side caching (5-min TTL) and lightweight vanilla execution.
4. **Editorial Polish:** Every micro-interaction, from the vinyl disc slide to the audio preview toggle and hover transitions, must feel premium and intentional.

## Accessibility & Inclusion

- Semantic HTML5 landmark structure (`header`, `main`, `section`, `footer`)
- High-contrast text compliance (minimum 4.5:1 ratio for body, 3:1 for large display metrics)
- Meaningful `alt` attributes on cover art and avatars with descriptive fallbacks
- Accessible keyboard navigation and visible focus rings
- Reduced motion support via `@media (prefers-reduced-motion: reduce)`
