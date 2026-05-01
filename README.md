# GGLaunch

The launchpad where liquidity cannot be pulled. Built on Solana.

## Stack

- Next.js 14 (App Router)
- React 18
- Recharts (price charts)
- Lucide React (icons)
- Inline styles (everything in `app/GGLaunch.jsx`)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Deploy

Push to GitHub, then connect the repo to Vercel. Vercel auto-detects Next.js — no config required.

## Adding backend (later)

Server routes go in `app/api/[name]/route.js`. Server components stay as `.js` without the `'use client'` directive. The current `GGLaunch.jsx` is a client component because it uses hooks and animations.
