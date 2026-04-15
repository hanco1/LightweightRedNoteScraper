# Lightweight RedNote Scraper

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-181717?logo=github)](https://github.com/hanco1/LightweightRedNoteScraper)
[![Issues](https://img.shields.io/github/issues/hanco1/LightweightRedNoteScraper?color=2ea44f&label=Issues)](https://github.com/hanco1/LightweightRedNoteScraper/issues)
[![Vercel Live](https://img.shields.io/badge/Live-Vercel-000000?logo=vercel)](https://vercel-lightweightrednotescraper.vercel.app/)
[![Docs](https://img.shields.io/badge/Docs-User%20Flow%20%26%20Architecture-6f42c1)](./docs)

[Run locally](#run-locally) · [Live app](https://vercel-lightweightrednotescraper.vercel.app/) · [Chinese README](./README.zh-CN.md) · [User flow](./docs/user-flow.md) · [Architecture](./docs/architecture.md)

A lightweight, mobile-first RedNote/Xiaohongshu scraper for public posts. Paste one public link, read the caption, tags, photos, videos, and Live Photo motion files, then save what you need directly from your phone. No ads, no account login, no cookies, no server-side history.

## Preview

### Chinese mobile view

![Chinese mobile preview](./docs/images/mobile-home-zh.png)

### English mobile view

![English mobile preview](./docs/images/mobile-home-en.png)

## What it does

- Captures one public RedNote/Xiaohongshu post at a time
- Extracts title, caption, tags, publish time, IP location, and interaction counts
- Supports images, videos, and Live Photo motion files
- Provides a mobile-first bilingual interface in Chinese and English
- Lets users save one media item or save all media in one pass

## Why it feels lightweight

- No database
- No login flow
- No account state
- No cookies
- No server-side history
- No ads or dashboard clutter
- Fast single-link flow tuned for mobile browsers

## Product boundaries

- Public posts only
- No comments
- No login-based data
- No permanent server-side storage
- No local folder picker in the hosted mobile version

## How it works

1. Paste a public Xiaohongshu / RedNote link or raw share text.
2. The page sends the input to `POST /api/capture`.
3. The server fetches the public page and extracts `window.__INITIAL_STATE__`.
4. The response is normalized into one payload with metadata and media.
5. Media is previewed and downloaded through the same-origin `/api/media` proxy.

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
│  ├─ capture.js
│  └─ media.js
├─ docs/
│  ├─ architecture.md
│  ├─ architecture.zh-CN.md
│  ├─ user-flow.md
│  ├─ user-flow.zh-CN.md
│  ├─ images/
│  └─ diagrams/
├─ iphone/
│  └─ index.html
├─ lib/
│  ├─ i18n.js
│  └─ xhs.js
├─ tests/
│  ├─ i18n.test.js
│  ├─ media.test.js
│  └─ xhs.test.js
├─ app.js
├─ dev-server.mjs
├─ index.html
├─ styles.css
└─ vercel.json
```

## Run locally

Requirements:

- Node.js 20+

```bash
npm install
npm test
npm run dev
```

Then open [http://127.0.0.1:3015](http://127.0.0.1:3015).

## Deploy to Vercel

```bash
vercel
vercel --prod
```

## Documentation

- Chinese README: [README.zh-CN.md](./README.zh-CN.md)
- User flow: [docs/user-flow.md](./docs/user-flow.md)
- User flow (Chinese): [docs/user-flow.zh-CN.md](./docs/user-flow.zh-CN.md)
- Architecture: [docs/architecture.md](./docs/architecture.md)
- Architecture (Chinese): [docs/architecture.zh-CN.md](./docs/architecture.zh-CN.md)
- Draw.io user flow: [docs/diagrams/user-flow.drawio](./docs/diagrams/user-flow.drawio)
- Draw.io architecture: [docs/diagrams/architecture.drawio](./docs/diagrams/architecture.drawio)

## Disclaimer

Copyright belongs to the platform and the original creators.  
This project does not store account cookies and does not permanently store fetched content on the server.
