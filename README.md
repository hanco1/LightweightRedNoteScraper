# Lightweight RedNote Scraper

[English](./README.md) · [简体中文](./README.zh-CN.md)

A lightweight, mobile-first RedNote (Xiaohongshu) scraper for public posts.

Paste one public link, fetch the caption, tags, photos, videos, and Live Photo motion files, then save what you want directly from your phone. No ads, no account login, no cookies, and no server-side history.

## Why this project exists

- Lightweight: no database, no login flow, no heavy dashboard
- Fast: fetches a single public post and renders the result immediately
- Mobile-first: optimized for phone browsers and quick save actions
- Clean: no ads, no tracking UI, no unnecessary setup for end users

## Highlights

- Works with public RedNote/Xiaohongshu posts
- Mobile web UI with Chinese and English language switch
- No cookies and no account credentials required
- No server-side history; refreshing the page clears the current session
- Save individual items or save all media in one pass
- Media preview and download are proxied through the same domain for better browser compatibility

## Product boundaries

- Public posts only
- No comments
- No login-based data
- No permanent server-side storage
- No local folder picker in the hosted mobile version

## Tech stack

- Frontend: plain HTML, CSS, and JavaScript
- API: Vercel Node.js Functions
- Parsing: public page extraction with Node.js and `vm`
- Media delivery: same-origin proxy endpoint for images and videos
- Testing: Node built-in test runner
- Deployment: Vercel

## Project structure

```text
.
├─ api/
│  ├─ capture.js        # Stateless public-post capture endpoint
│  └─ media.js          # Same-origin media proxy for preview/download
├─ iphone/
│  └─ index.html        # Optional secondary mobile entry
├─ lib/
│  ├─ i18n.js           # UI copy for Chinese and English
│  └─ xhs.js            # Public link parsing and payload normalization
├─ tests/
│  ├─ i18n.test.js
│  ├─ media.test.js
│  └─ xhs.test.js
├─ app.js               # Mobile page behavior
├─ styles.css           # Mobile-first UI styling
├─ index.html           # Main mobile entry
├─ dev-server.mjs       # Local dev server
└─ vercel.json          # Vercel config
```

## Local development

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:3015](http://127.0.0.1:3015).

## Deploy to Vercel

This repository is designed to work well on Vercel.

```bash
vercel
```

Deploy a preview first, review it on mobile, then promote when ready:

```bash
vercel deploy --prod
```

## Documentation

- Chinese README: [README.zh-CN.md](./README.zh-CN.md)
- User flow: [docs/user-flow.md](./docs/user-flow.md)
- Architecture: [docs/architecture.md](./docs/architecture.md)
- Draw.io user flow: [docs/diagrams/user-flow.drawio](./docs/diagrams/user-flow.drawio)
- Draw.io architecture: [docs/diagrams/architecture.drawio](./docs/diagrams/architecture.drawio)

## Disclaimer

Copyright belongs to the platform and the original creators.  
This project does not store account cookies and does not permanently store fetched content on the server.
