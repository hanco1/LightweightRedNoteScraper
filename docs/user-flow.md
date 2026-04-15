# User Flow

This app is a mobile-first RedNote/Xiaohongshu saver for public posts. The goal is simple: paste one public link, capture it once, and keep the result easy to read and easy to save.

## Primary journey

1. Open the app in a phone browser.
2. Paste a public RedNote/Xiaohongshu link, or share text that contains one.
3. Tap the main capture button.
4. The frontend sends `POST /api/capture` with the pasted value.
5. The API validates the request, extracts the public URL, fetches the public page, parses the embedded note state, and normalizes the payload.
6. The page renders the cleaned result:
   - title
   - caption with tags removed
   - author
   - publish time
   - IP location when present
   - likes, saves, comments, and shares
   - image, video, and live-photo media cards
7. Media previews and downloads use the same-origin proxy at `/api/media`, which keeps playback and saving more reliable on mobile browsers, including Safari.
8. The user can open the original post, save one item, save everything, or reload a preview that failed to paint.
9. Refreshing the page clears the current result. Nothing is kept in server history.

## Why this flow stays lightweight

- One screen, one capture path
- No login or cookies
- No database and no server-side history
- No background jobs or admin surface
- Same-origin media proxy only when media needs to be previewed or saved
