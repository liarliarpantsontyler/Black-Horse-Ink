# Scripts

## import:instagram (recommended)

If the API sync fails (common without a logged-in session), use the batch importer:

1. Scrape public profile post URLs/thumbs (or refresh `scripts/ig-import-batch.json`).
2. Run:

```bash
npm run import:instagram
```

This downloads images into `public/images/`, updates artist portraits, `hero.jpg`, and `portfolio.generated.json`.

## sync-instagram.mjs

Pulls recent posts from the studio artists’ public Instagram profiles and updates:

- `public/images/portfolio/{artist}/`
- `public/images/artists/{artist}-portrait.jpg`
- `src/content/portfolio.generated.json`

### Usage

```bash
INSTAGRAM_SESSION_ID=your_session_cookie npm run sync:instagram
```

### Getting `INSTAGRAM_SESSION_ID`

1. Log into Instagram in a desktop browser.
2. Open DevTools → Application → Cookies → `instagram.com`.
3. Copy the value of `sessionid`.

Instagram may rate-limit or block unauthenticated requests. Use the session cookie only on a trusted machine; never commit it or expose it in client env vars.

### Overrides

Edit `src/content/portfolio.overrides.json` to fix tags or alt text per portfolio `id`:

```json
{
  "lucia-ig-ABC123": {
    "tags": ["fine-line", "small"],
    "featured": true,
    "alt": "Fine-line floral wrist tattoo by Lucia"
  }
}
```

### Terms

Ensure the studio has rights to display and host these images on their website. Automated scraping may violate Meta’s Terms of Service if misused — prefer official exports or licensed assets when available.

## sync-google-reviews.mjs

Pulls public Google Business reviews into `src/content/reviews.generated.json`. The site also fetches live reviews at runtime when `GOOGLE_PLACES_API_KEY` and `studio.googlePlaceId` are set (cached 24h).

### Usage

```bash
GOOGLE_PLACES_API_KEY=your_key npm run sync:google-reviews
```

Optional: `GOOGLE_PLACE_ID=ChIJ...` overrides the ID in `site.config.ts`.

### Google Cloud setup

1. Create or use a Google Cloud project.
2. Enable **Places API (New)** (not legacy Places API unless you adapt the script).
3. Create an API key; restrict it to Places API (New) and your production domain / server IPs.
4. Find the studio **Place ID** from the Google Maps listing (Share → embed or Place ID tools).

Reviews shown on the site are limited to what Google returns (typically up to five recent reviews with text).
