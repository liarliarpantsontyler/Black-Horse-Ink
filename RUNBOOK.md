# Black Horse Ink — Deploy & Handoff Runbook

## 1. Supabase

1. Create or select a Supabase project.
2. Run migration: `supabase/migrations/20260320120000_init.sql` (SQL editor or CLI).
3. Confirm storage bucket `lead-references` exists (private).
4. Create an Auth user for studio staff (email + password).
5. Insert admin allowlist row:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

## 2. Environment variables (Vercel)

Copy from `.env.example`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for links and Quo `sourceUrl` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + RLS admin reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Lead API writes + signed URLs (server only) |
| `SMS_PROVIDER` | `mock` until Quo is ready, then `quo` |
| `QUO_API_KEY` | Quo API key (server only) |
| `QUO_PHONE_NUMBER_ID` | Quo sender ID (`PN…`) |
| `LEAD_NOTIFY_PHONE` | E.164 number for new-lead SMS alerts (default `+19402524142`) |
| `LEAD_NOTIFY_EMAIL` | Inbox for new-lead email alerts |
| `EMAIL_PROVIDER` | `mock` or `resend` |
| `RESEND_API_KEY` | Resend API key when `EMAIL_PROVIDER=resend` |
| `RESEND_FROM` | Verified sender address in Resend |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Ads conversion label for `quote_completed` |
| `GOOGLE_PLACES_API_KEY` | Places API (New) — live Google reviews on homepage |

**Handoff testing:** Keep `SMS_PROVIDER=mock`. Staff receives leads in `/admin/leads` and texts manually from Google Voice. Copy the confirmation message from the lead detail page.

## 3. Vercel deploy

1. Import repo, set env vars, deploy.
2. Smoke test: homepage, quote flow submit, admin login.

## 4. Content

1. Edit `src/content/site.config.ts` — replace `[CITY, STATE]`, address, hours, shop minimum, FAQ placeholders.
2. Run Instagram sync locally: `npm run sync:instagram` (see `scripts/README.md`).
3. Commit updated images + `portfolio.generated.json`.
4. **Google reviews:** In [Google Maps](https://www.google.com/maps), open the studio listing → Share → copy the Place ID (or use Place ID finder). Set `studio.googlePlaceId` in `src/content/site.config.ts`. Enable **Places API (New)** on the Google Cloud project, create an API key restricted to that API, and set `GOOGLE_PLACES_API_KEY` in Vercel. Optionally run `npm run sync:google-reviews` and commit `reviews.generated.json` as a fallback when the API is unavailable at build time.

## 5. Switch to Quo (production SMS)

1. Set `SMS_PROVIDER=quo`, add `QUO_API_KEY` and `QUO_PHONE_NUMBER_ID`.
2. Submit a test lead; confirm contact + SMS in Quo.
3. Use **Retry SMS sync** on lead detail if a lead failed during outage.

## 6. Google Ads conversion

1. Link GA4 to Google Ads.
2. Import `quote_completed` as primary conversion.
3. Test with Tag Assistant or GA4 DebugView.

## 7. Legal

Review `/privacy` placeholder copy with owner before running paid traffic.
