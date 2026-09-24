# InterEd Hub

A video-first online course platform. Students stream lessons, pin notes to the
exact second, keep a daily learning streak and earn verifiable certificates.
Teachers build courses in a studio with drag-and-drop curriculum and direct
video uploads to Neon Object Storage.

- API (Django REST Framework + Neon): https://github.com/junaaid96/inter_ed_hub-drf
- Live: https://inter-ed-hub-nextjs.vercel.app/

## Features

**Learners**
- Catalog with search, subject, level, length and rating filters (all URL-synced and shareable)
- Course pages with free-preview lessons, curriculum, instructor card and rating breakdown
- Learning player: resume where you left off, speed memory, keyboard shortcuts
  (`Space/K`, `J/L`, `←/→`, `[`/`]`, `F`, `M`, `N`, `?`), auto-advance countdown and
  automatic re-signing of expired video URLs
- **Timestamped notes**: press `N` while watching, click a note to jump back
- Per-lesson **discussion** with timestamps and highlighted instructor replies
- Dashboard with **streaks**, weekly minutes, a 12-week activity heatmap and continue-learning
- Printable, shareable **certificates** with a public verification link

**Teachers**
- Studio: sections, video and reading lessons, drag-and-drop reordering, preview toggles
- Direct-to-storage uploads with progress, speed and ETA; files over 64 MB upload in
  parallel chunks with per-chunk retries; **bulk upload** turns dropped videos into lessons
- Dashboard: learners, rating, minutes watched, 30-day enrollment chart, question inbox,
  per-course completion rates

**Everywhere**: light and dark theme, responsive down to phones, accessible labels,
focus states and reduced-motion support.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Phosphor icons ·
react-markdown. No UI kit; design tokens live in `app/globals.css`.

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the API
npm run dev
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Django API, e.g. `https://inter-ed-hub-drf.onrender.com` |

## Project layout

```
app/                 routes (catalog, course, learn player, dashboard, studio, auth, certificates)
components/          UI primitives, course cards, charts, player and studio components
lib/api.js           fetch wrapper with token auth and DRF error parsing
lib/upload.js        presigned single/multipart uploads with progress
lib/auth.js          session context
```
