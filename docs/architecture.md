# Architecture

This project is a mobile-first public RedNote/Xiaohongshu scraper. It is intentionally stateless: users paste one public link, the app captures it once, and the server keeps no history.

## Runtime pieces

### Mobile frontend

Files:

- `index.html`
- `styles.css`
- `app.js`
- `lib/i18n.js`

Responsibilities:

- render the mobile UI
- handle English and Chinese copy
- submit one public link or share text
- render the normalized response
- expose preview, save-one, and save-all actions

### Capture API

File:

- `api/capture.js`

Responsibilities:

- accept `POST` requests
- read the pasted input
- call `fetchCaptureFromPublicLink`
- return a normalized JSON payload or a clear error response

### Parsing and normalization

File:

- `lib/xhs.js`

Responsibilities:

- extract the first public Xiaohongshu/RedNote URL from pasted text
- fetch the public page with browser-like headers
- parse `window.__INITIAL_STATE__` safely
- normalize title, caption, tags, author, publish time, IP location, interactions, and media
- convert upstream media URLs into same-origin proxy URLs
- allow only trusted Xiaohongshu/XHS media hosts through the proxy layer

### Media proxy

File:

- `api/media.js`

Responsibilities:

- serve `GET` and `HEAD` requests
- validate the target URL
- forward `Range` requests for playback
- stream upstream media through the same origin
- keep image and video previewing compatible with mobile browsers

### Local development

File:

- `dev-server.mjs`

Responsibilities:

- serve the same frontend locally
- route `/api/capture` and `/api/media`
- keep the development loop close to production behavior

## Data flow

1. The user pastes a public link or share text.
2. The frontend sends the value to `POST /api/capture`.
3. `api/capture.js` validates the request and calls `fetchCaptureFromPublicLink`.
4. `lib/xhs.js` extracts the public URL, fetches the public page, and parses the embedded note state.
5. The capture pipeline returns normalized JSON with title, description, tags, author, publish time, IP location, interactions, source URL, note type, and media items.
6. The page renders metadata and media cards.
7. Previews and downloads go through `/api/media?url=...` so media stays same-origin.

## Design constraints

- No database
- No login flow
- No server-side history
- No background jobs
- One capture request per interaction
- Same-origin media proxy only when media needs to be shown or saved
