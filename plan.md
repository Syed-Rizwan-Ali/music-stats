# plan.md — Personal Listening Stats Website

## 1. Goal

A personal website that shows **my own** Spotify listening data, pulled from the public stats.fm API. It is a side project meant to be shared via a link. It is read-only: no login, no API key, no backend.

- stats.fm username: `r1zzler` (keep this in ONE config constant so it can be changed easily)
- Visual reference: the attached screenshot (dark "bento grid" dashboard, called VibePulse). Match its layout, spacing, and mood.

## 2. Tech Stack

- Plain **HTML + CSS + vanilla JavaScript (ES modules)**. No framework, no build step, so it runs with VS Code Live Server (`127.0.0.1:5500`).
- Tailwind via CDN is allowed. Otherwise hand-written CSS with CSS variables.
- Fonts: Inter (UI) + JetBrains Mono (numbers and small labels), from Google Fonts.
- Icons: Lucide via CDN, or inline SVG.
- Deploy later to Vercel, Netlify, or GitHub Pages (static hosting).

## 3. File Structure

```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js      # USERNAME, BASE_URL, range presets
│   ├── api.js         # fetch + cache + error handling
│   ├── utils.js       # formatters + getAlbumArt() etc.
│   ├── render.js      # one render function per card
│   └── main.js        # init, range toggle, orchestration
├── assets/
│   └── placeholder-cover.svg   # fallback when art is missing
└── plan.md
```

## 4. API Reference

Base URL: `https://api.stats.fm/api/v1`

The browser can call it directly with `fetch()` (CORS works; it was tested from `127.0.0.1`). No auth is needed as long as the stats.fm profile has its stats set to **public**.

### 4.1 Verified endpoint (confirmed working)

```
GET /users/r1zzler/top/tracks?range=weeks&range_value=1&limit=10
```

Verified response shape:

```json
{
  "items": [
    {
      "position": 1,
      "streams": 13,
      "playedMs": 3614219,
      "indicator": null,
      "track": {
        "id": 366624100,
        "name": "XIII",
        "durationMs": 284929,
        "explicit": false,
        "spotifyPopularity": 0,
        "spotifyPreview": "https://p.scdn.co/mp3-preview/...",
        "appleMusicPreview": null,
        "externalIds": { "spotify": ["2KblvdmJMiPRiSXNWk2KAG"], "appleMusic": [] },
        "albums":  [{ "id": 69773943, "name": "XIII", "image": "https://i.scdn.co/image/ab67616d..." }],
        "artists": [{ "id": 1676346, "name": "Aurat", "image": "https://i.scdn.co/image/ab676161..." }]
      }
    }
  ]
}
```

### 4.2 Field mapping (use exactly these paths)

| UI needs | Field path |
|---|---|
| Rank | `item.position` |
| Play count | `item.streams` |
| Time listened (ms) | `item.playedMs` |
| Track title | `item.track.name` |
| **Album cover URL** | **`item.track.albums[0].image`** |
| Album name | `item.track.albums[0].name` |
| Artist names | `item.track.artists.map(a => a.name).join(", ")` |
| Artist photo | `item.track.artists[0].image` |
| Duration | `item.track.durationMs` |
| Explicit badge | `item.track.explicit` |
| Open in Spotify | `https://open.spotify.com/track/${item.track.externalIds.spotify[0]}` (spotify array may be empty) |
| 30s preview | `item.track.spotifyPreview` (**can be `null`**) |

### 4.3 Known pitfalls

1. **Broken album art bug.** The earlier demo showed alt text instead of covers because the code did not read `track.albums[0].image`. The image field lives on the album object, not on the track.
2. **Don't hardcode the image host.** Most covers come from `i.scdn.co`, but some come from `is1-ssl.mzstatic.com` (Apple). Use the URL exactly as returned.
3. **Arrays can be empty or missing.** Always use optional chaining: `item.track.albums?.[0]?.image ?? PLACEHOLDER`.
4. **Add `onerror` on every `<img>`** that swaps in `assets/placeholder-cover.svg`.
5. **Multiple artists.** Join the names. Don't show only the first.
6. **Terminology.** stats.fm calls plays "streams". Say "plays" or "streams" in the UI, never "scrobbles" (that is Last.fm wording from the reference mockup).

### 4.4 Other endpoints (UNVERIFIED — test each in the console first)

Before building each card, log the raw response and confirm the field names. Do not assume the shapes.

```
GET /users/r1zzler                         → profile (name, image, etc.)
GET /users/r1zzler/top/artists?range=...&limit=5
GET /users/r1zzler/top/albums?range=...&limit=5
GET /users/r1zzler/top/genres?range=...&limit=5
GET /users/r1zzler/streams/stats?range=...        → total streams, total durationMs, etc.
GET /users/r1zzler/streams/recent?limit=20        → recently played
```

If an endpoint does not exist or returns different data than expected, **leave that card out** instead of faking data, and note it in the final summary.

### 4.5 Range presets (`config.js`)

| Toggle label | Query params (verify `months` / `lifetime` values) |
|---|---|
| This Week | `range=weeks&range_value=1` |
| Last 30 Days | `range=months&range_value=1` |
| All Time | `range=lifetime` |

## 5. UI Layout (match the reference screenshot)

Dark theme, max-width about 1100px, centered, with a 12-column CSS grid and about 16px gaps. Cards have a 1px subtle border, ~16px radius, and a slightly lighter background than the page.

**Header bar**
- Left: avatar (with a green online dot), display name, `@r1zzler`, total stream count in the mono font.
- Center: segmented toggle: `This Week | Last 30 Days | All Time`. Clicking it re-fetches all cards.
- Right: "Share" button that copies the current page URL to the clipboard and shows a small "Copied!" toast.
- Do **not** include the "PRO" badge from the mockup.

**Row 1**
- **Top Track hero card (wide):** large cover art, "TOP TRACK #1" pill, plays pill, track title, artist (accent green), album name, time listened, subtle gradient background tinted from the cover.
- **Listening Time card:** total time listened (formatted `34h 12m`), a daily-average progress bar.
- **Top Genres card:** stacked horizontal bar plus legend with percentages (only if the genres endpoint works).

**Row 2**
- **Top Tracks list (the missing piece from the demo):** ranked 01–10 with cover, title, artists, plays on the right. Hover state highlights the row. Clicking opens Spotify.
- **Top Artists card:** top 5 with round photos, name, and stream count.

**Row 3 (stretch)**
- **Listening Intensity heatmap** (calendar grid, green scale), only if it can be derived from real data.
- **Recently Played stream:** the last ~8 tracks with "x mins ago" labels. Add a scroll area.

**Footer:** small text, "Data from stats.fm", plus a link to the stats.fm profile.

### Design tokens

```css
:root {
  --bg: #0a0a0b;
  --card: #111113;
  --card-border: #1f1f23;
  --text: #f4f4f5;
  --muted: #8b8b94;
  --accent: #22c55e;      /* green, used for artist names and highlights */
  --radius: 16px;
}
```

## 6. Behavior Requirements

- **Loading:** skeleton shimmer placeholders in each card while fetching.
- **Errors:** if one request fails, show a small inline "Couldn't load this" message in that card only. The rest of the page must keep working.
- **Empty state:** if `items` is empty, show "No listening data for this period."
- **Parallel fetching:** load all cards with `Promise.all` (or `allSettled`).
- **Caching:** cache responses in `localStorage` with a 5-minute TTL, keyed by URL, to avoid hammering the API.
- **Range switching:** changing the range re-renders every card without a full page reload.
- **Formatters (`utils.js`):**
  - `formatDuration(ms)` → `"34h 12m"` or `"8m"`
  - `timeAgo(dateString)` → `"2 mins ago"`
  - `getAlbumArt(item)` → returns the cover URL or the placeholder
  - `escapeHTML(str)` for any text inserted via `innerHTML` (or use `textContent`)
- **Responsive:** 3 columns on desktop, 2 on tablet, 1 on mobile. Check at 375px width.
- **Accessibility:** meaningful `alt` text, visible focus states, sufficient contrast.

## 7. Build Order

1. Scaffold the files, `config.js`, and `api.js`. Log the raw response for `top/tracks`.
2. Build **Top Tracks list** with working cover art (fixes the earlier bug). Confirm all 10 covers render.
3. Build the header and the range toggle.
4. Build the Top Track hero card and the Listening Time card.
5. Test each unverified endpoint in the console, then build the Top Artists and Top Genres cards.
6. Build Recently Played.
7. Stretch: heatmap and streak. Only build these from real data.
8. Polish: skeletons, error states, responsive pass, README with deploy steps.

## 8. Out of Scope

- No Spotify OAuth and no direct Spotify API calls.
- No user accounts, database, or backend.
- No fake or hardcoded listening data in the final version. Mock data is allowed only temporarily for layout, and must be removed.

## 9. Definition of Done

- All 10 top tracks show **real cover art**.
- Toggling the range updates every card.
- One failing endpoint does not break the page.
- Looks close to the reference screenshot on desktop and works on mobile.
- Changing `USERNAME` in `config.js` is all that's needed to show a different user.
