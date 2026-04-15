# User Flow

## Primary user journey

1. Open the mobile page in Safari, Chrome, or any phone browser.
2. Paste a public RedNote/Xiaohongshu link or share text.
3. Tap the primary action button.
4. The frontend sends the link to `POST /api/capture`.
5. The API extracts the public URL, fetches the public page, parses the embedded note state, and normalizes the response.
6. The page renders:
   - title
   - cleaned caption
   - tags
   - publish time
   - IP location if available
   - interactions
   - media cards
7. The user can:
   - open the original post
   - save one item
   - save all media
   - reload previews if one image fails to paint
8. Refreshing the page clears the current result.

## Why this flow is lightweight

- One screen
- One request to capture
- No login
- No cookies
- No stored history
- No extra admin surface
