# VibePulse — Personal stats.fm Listening Dashboard

A personal Spotify listening dashboard pulling live data from the public **stats.fm API**. Designed with a dark bento-grid layout, vinyl physical touches, audio previews, and mobile-first responsiveness.

![VibePulse](assets/placeholder-cover.svg)

---

## 🌟 Key Features

- **Top 10 Tracks with Authentic Artwork:** Dynamically extracts real album artwork from `track.albums[0].image` across Spotify (`i.scdn.co`) and Apple Music (`mzstatic.com`) CDNs with fallback handling.
- **Realistic Vinyl Sleeve Motif:** The #1 Top Track hero card features an album sleeve with a vinyl record that smoothly slides out and spins during audio previews.
- **Interactive 30s Audio Previews:** Listen to 30-second track previews directly in the browser with an animated equalizer waveform.
- **Time Range Switching:** Instantly toggle between **This Week**, **Last 30 Days**, and **All Time** without full page reload.
- **Top Artists Ranking:** Circular artist avatars, stream counts, and movement indicators (`+2`, `0`, `-1`, `NEW`, `+4`).
- **Listening Intensity Heatmap:** Real weekday and hourly distribution derived from the stats.fm dates API (`/streams/stats/dates`).
- **Live Streams Stream:** Recent tracks with relative timestamps ("2 mins ago").
- **Shareable:** "Share Weekly Recap" button copies the dashboard URL to the clipboard with an animated toast notification.
- **Fault-Tolerant:** Independent card rendering with `Promise.allSettled`; if any single endpoint is unavailable, that card displays an isolated fallback while the rest of the page functions seamlessly.
- **Client-Side Caching:** 5-minute LocalStorage TTL keyed by URL to respect API rate limits.

---

## 🚀 Getting Started

### Option 1: Built-in Node Server
```bash
node server.js
```
Open [http://127.0.0.1:5500](http://127.0.0.1:5500) in your browser.

### Option 2: VS Code Live Server
1. Open this folder in VS Code.
2. Click **Go Live** on the status bar (default port: `5500`).

---

## ⚙️ Configuration

To display listening stats for another stats.fm user, edit **`js/config.js`**:

```javascript
// Target stats.fm username
export const USERNAME = 'your_username';
```

*(Ensure the stats.fm account profile has its stats set to **public**).*

---

## 📁 File Structure

```
/
├── index.html                  # Semantic dashboard markup
├── css/
│   └── styles.css              # Vanilla CSS design system & tokens
├── js/
│   ├── config.js               # USERNAME, BASE_URL, range presets
│   ├── api.js                  # Fetch with 5-minute localStorage caching
│   ├── utils.js                # Duration formatters, timeAgo, cover extractor
│   ├── render.js               # Bento card render functions
│   └── main.js                 # Range switching & audio preview orchestration
├── assets/
│   └── placeholder-cover.svg   # Fallback SVG when artwork is unavailable
├── PRODUCT.md                  # Impeccable product truth specification
├── DESIGN.md                   # Impeccable design system & authority
└── plan.md                     # Engineering specification
```

---

## 🌐 Deployment (Static Hosting)

Since this project uses vanilla HTML, CSS, and ES modules with no build step, it can be deployed to any static host:

### GitHub Pages
1. Push repository to GitHub.
2. In **Settings > Pages**, select `main` branch root `/` and click **Save**.

### Vercel
```bash
npx vercel
```
Accept default settings (no build command needed).

### Netlify
```bash
npx netlify deploy --prod --dir=.
```
Or drag and drop the folder into the Netlify dashboard.
