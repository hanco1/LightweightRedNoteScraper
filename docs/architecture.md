# Architecture

## Overview

This project is a lightweight, stateless RedNote/Xiaohongshu scraper for public posts.

It is designed around one mobile page and two serverless endpoints:

- `POST /api/capture`
- `GET /api/media`

## Runtime pieces

### 1. Mobile frontend

Files:

- `index.html`
- `styles.css`
- `app.js`
- `lib/i18n.js`

Responsibilities:

- render the mobile UI
- handle Chinese / English language switching
- submit one public link
- render the normalized response
- trigger one-by-one save or save-all actions

### 2. Capture API

File:

- `api/capture.js`

Responsibilities:

- validate the incoming request
- extract the public Xiaohongshu URL from raw share text
- call the capture pipeline in `lib/xhs.js`
- return a normalized JSON payload

### 3. Parsing and normalization

File:

- `lib/xhs.js`

Responsibilities:

- resolve the public post URL
- fetch the public HTML page
- extract `window.__INITIAL_STATE__`
- parse the note payload safely
- normalize title, caption, tags, interactions, publish time, IP location, and media
- convert raw media URLs into proxyable same-origin URLs

### 4. Media proxy

File:

- `api/media.js`

Responsibilities:

- proxy images and videos through the same origin
- support preview and download flows
- forward range requests for media playback
- improve compatibility for iPhone and Safari

### 5. Local development

File:

- `dev-server.mjs`

Responsibilities:

- serve the same frontend files locally
- route `/api/capture` and `/api/media`
- provide a fast local loop before deploying to Vercel

## Data flow

1. User pastes a public link.
2. Frontend posts the input to `POST /api/capture`.
3. `api/capture.js` calls `fetchCaptureFromPublicLink`.
4. `lib/xhs.js` fetches the public page and parses the note state.
5. The normalized payload is returned to the page.
6. The page renders metadata and media cards.
7. Media preview and save actions use `/api/media?url=...`.

## Why the system stays fast

- No database
- No login flow
- No server-side history
- No background jobs
- One capture request per page interaction
- Same-origin media proxy only when needed
