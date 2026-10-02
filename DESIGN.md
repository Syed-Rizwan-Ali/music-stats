# Design System & Authority (VibePulse / stats.fm Dashboard)

<!-- impeccable:design-schema 1 -->

Extracted from the VibePulse reference screenshot and verified against stats.fm product requirements.

## 1. Core Visual World

- **Theme Mode**: Deep Dark Bento Grid
- **Surface Vibe**: High-precision streaming analytics dashboard with editorial music-album physical touches (vinyl sleeve motif).
- **Spatial Concept**: 12-column responsive bento grid with 16px card gaps, rounded 16px corners, 1px subtle boundary strokes, and restrained neon green accents.

## 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  /* Base Backgrounds */
  --bg-primary: #0a0a0b;          /* Ultra-deep dark canvas */
  --bg-surface: #111115;          /* Bento card background */
  --bg-surface-hover: #16161b;    /* Hovered card/row background */
  --bg-surface-elevated: #1a1a22; /* Nested pills, inputs, sub-cards */
  --bg-subtle: #141418;           /* Faint containers */

  /* Borders & Dividers */
  --border-subtle: #1f1f26;       /* Standard 1px card border */
  --border-hover: #2e2e38;        /* Hover border highlight */
  --border-active: #22c55e44;     /* Green-tinted active border */

  /* Text & Foreground */
  --text-primary: #f4f4f6;        /* Pure crisp high-contrast off-white */
  --text-secondary: #a1a1aa;      /* Medium slate gray for secondary labels */
  --text-muted: #71717a;          /* Muted metadata, timestamps */
  --text-faint: #52525b;          /* Grid axis lines, subtle badges */

  /* Brand & Status Accents */
  --accent-green: #22c55e;        /* Emerald brand accent */
  --accent-green-hover: #16a34a;  /* Darker green button hover */
  --accent-green-glow: rgba(34, 197, 94, 0.25);
  --accent-green-subtle: rgba(34, 197, 94, 0.12);
  --accent-green-text: #4ade80;   /* Light vibrant green for links/highlights */

  /* Multi-Genre / Multi-Metric Spectrum */
  --genre-purple: #a855f7;        /* Indie Electronic */
  --genre-cyan: #06b6d4;          /* Dream Pop */
  --genre-pink: #ec4899;          /* Synthwave */
  --genre-amber: #f59e0b;         /* Post-Rock / Streaks */

  /* Heatmap Matrix Scale */
  --heat-0: #16161c;              /* 0 plays */
  --heat-1: #133a20;              /* Low activity */
  --heat-2: #166534;              /* Moderate activity */
  --heat-3: #22c55e;              /* High activity */
  --heat-4: #4ade80;              /* Peak activity */

  /* Elevation & Shadows */
  --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.6);
  --shadow-vinyl: 0 8px 30px rgba(0, 0, 0, 0.85);
  --shadow-glow: 0 0 20px rgba(34, 197, 94, 0.35);

  /* Radii */
  --radius-card: 16px;
  --radius-pill: 9999px;
  --radius-inner: 10px;
  --radius-badge: 6px;
}
```

### 2.2 Typography Hierarchy

- **Primary UI & Headings**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Body measure: 60-70ch
  - Weights: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
- **Data & Numbers**: `'JetBrains Mono', 'Fira Code', monospace`
  - Used strictly for stream counts, durations, percentages, ranks (01-10), and timestamps.

| Token / Role | Family | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `display-hero` | Inter | 28px - 32px | 800 | -0.03em | Top Track Title |
| `display-metric`| JetBrains Mono | 36px | 700 | -0.02em | "34h 12m" Listening Time |
| `heading-section`| Inter | 16px | 600 | -0.01em | Card Titles ("Top Artists", "Listening Intensity") |
| `kicker-pill` | JetBrains Mono | 11px | 700 | 0.06em | "● TOP TRACK #1", "LISTENING TIME" |
| `body-ui` | Inter | 14px | 500 | 0 | Track names, artist names, nav links |
| `body-secondary`| Inter | 12px - 13px | 400 | 0 | Album names, subtitles |
| `data-mono` | JetBrains Mono | 12px | 500 | 0 | Stream counts, durations ("8h 12m listened") |

## 3. Component System

### 3.1 Header Bar
- **Profile Area**: 44px round avatar with a 10px glowing green online indicator at the bottom-right.
  - Display name (bold Inter 16px) + customId handle (`@r1zzler`) + total streams badge in JetBrains Mono.
- **Segmented Range Pill**: Capsule pill group with 3 options (`This Week`, `Last 30 Days`, `All Time`).
  - Active state: `#1c1c24` background with crisp white text and subtle elevation.
  - Inactive state: `#71717a` text, transparent background, brightens on hover.
- **Action Button**: "Share Weekly Recap" with sparkle/share SVG icon.
  - Emerald green capsule pill (`#22c55e`), black bold text (`#0a0a0b`), interactive scale and copy feedback toast.

### 3.2 Hero Card: Top Track #1 (Vinyl Sleeve Motif)
- **Vinyl Record Interaction**:
  - Left side features the square album sleeve with real cover art.
  - High-fidelity vinyl record disk (concentric radial grooves, metallic vinyl sheen, circular center label with track art/accent) peeks out of the sleeve to the right.
  - Micro-interaction: On hover or audio play, the vinyl smoothly slides out and gently rotates with realistic turntable physics!
- **Badges**:
  - Green status pill: "● TOP TRACK #1"
  - Stream count pill: "142 Streams"
- **Metadata**:
  - Track title (extra bold 28px), artist (vibrant green `#22c55e`), album name & year.
  - Quick stats row: Clock icon + "8h 12m listened", Heart icon + "Favorite Track".
  - Audio Preview: Interactive play/pause button for 30s preview snippet with mini animated equalizer.
  - Divider rule (`1px solid #1f1f26`).
  - Footer row: Peak listening hour + percentage change badge.

### 3.3 Metric Card: Listening Time & Streak
- **Header**: "LISTENING TIME" uppercase kicker + headphones icon in rounded badge.
- **Hero Value**: Large 36px monospace duration (`34h 12m`).
- **Daily Average**: Mini progress bar with smooth multi-color gradient (purple to cyan to green).
- **Streak Container**: Nested pill box with flame icon (`#f59e0b`), "Daily Streak / Active every day", and bold amber duration ("18 Days").

### 3.4 Metric Card: Top Genres
- **Header**: "TOP GENRES" kicker + vinyl/target icon.
- **Segmented Horizontal Bar**: Rounded 8px height bar partitioned proportionately by genre percentages.
- **Legend List**: Colored indicator dots matching genre segments with name and right-aligned percentage in monospace.

### 3.5 Top 10 Tracks List Card
- **Ranked Rows (01–10)**:
  - Monospace rank number (`01`, `02`, ... `10`).
  - Real album cover image (44px x 44px, 8px radius, `object-fit: cover`, fallback to `placeholder-cover.svg` on error).
  - Title and Artist names (joined by commas) with explicit badges if applicable.
  - Audio preview trigger button (plays 30-sec sample).
  - Stream count in JetBrains Mono.
  - Direct Spotify link button on hover.
  - Smooth row hover background transition (`--bg-surface-hover`).

### 3.6 Top Artists Card (Top 5)
- **Avatar Rows**:
  - Round circular artist images (42px circle).
  - Rank number `#1` to `#5`.
  - Artist name + stream count.
  - Movement / Trend pill (`+2`, `0`, `-1`, `NEW`, `+4`).

### 3.7 Listening Intensity Heatmap Card
- **Title**: "Listening Intensity" with subtitle "Streams per day across peak hours".
- **Heat Legend**: "Less [][][][] More" with 5 green intensity steps.
- **Grid Layout**: 7 rows (days of week: Mon, Tue, Wed, Thu, Fri, Sat, Sun) x 16-24 hourly time slots.
- **Footer**: "Busiest Day: [Day] ([N] streams)" highlighted in accent green.

### 3.8 Live Streams / Recently Played
- **Header**: Pulsating green dot + "Live Streams", "Updated just now".
- **Scrollable Feed**: Recent tracks with album thumbnail, title, artist, and relative time ("2 mins ago"). Custom themed dark scrollbar.

## 4. Motion & Micro-interactions

- **Transitions**: `150ms - 250ms cubic-bezier(0.16, 1, 0.3, 1)` for clean, snappy physical feedback.
- **Vinyl Physics**: On track hover or preview playback, vinyl record disc slides out +30px and slowly rotates at 33 1/3 RPM.
- **Audio Wave**: When 30s preview is playing, a 3-bar animated SVG equalizer animates rhythmically.
- **Toast Notification**: "Link copied to clipboard!" slides up from bottom-right and fades after 2.5s.
- **Skeletons**: Subtle pulsing shimmer (`linear-gradient(90deg, #141418 0%, #1f1f26 50%, #141418 100%)`).

## 5. Absolute Craft Quality Floor

1. **Album Art Authenticity**: Every single one of the top 10 tracks MUST render authentic album artwork from `item.track.albums[0].image` with fallback `onerror`.
2. **Typography Discipline**: Monospace is reserved exclusively for numerical data, durations, ranks, and badges. Headings and body copy use Inter.
3. **No Saturated Halos**: Drop shadows use soft blur and dark offsets; no raw zero-offset neon glow outlines.
4. **Browser Polish**: Themed custom scrollbars, selection highlight (`background: #22c55e33; color: #f4f4f6`), and accessible `:focus-visible` rings.
