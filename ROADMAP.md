# Black Horse Ink — What's next

Living checklist for go-live and follow-ups. Operational detail stays in [RUNBOOK.md](./RUNBOOK.md).

## Now — notifications (planned)

Quote submissions save to Supabase today, but **SMS and staff email use mock providers** until env vars are set (`SMS_PROVIDER=mock`, `EMAIL_PROVIDER=mock`). The success screen does not mean texts or emails were delivered.

### Resend (staff email on every lead)

1. Create Resend account and API key.
2. **Quick test:** `RESEND_FROM=Black Horse Ink <onboarding@resend.dev>` (may only deliver to the Resend account email until a domain is verified).
3. **Production:** Verify site domain in Resend ? use e.g. `quotes@yourdomain.com` for `RESEND_FROM`.
4. Vercel (Production):

   - `EMAIL_PROVIDER=resend`
   - `RESEND_API_KEY=re_...`
   - `RESEND_FROM=...`
   - `LEAD_NOTIFY_EMAIL=...` (staff inbox)

5. Redeploy ? test submit ? confirm email + `/admin/leads` communication log.

### Quo (customer confirmation + staff SMS alert)

1. Quo account with shop texting number active.
2. API key + **Phone number ID** (`PN…`) for the send-from line.
3. Vercel (Production):

   - `SMS_PROVIDER=quo`
   - `QUO_API_KEY=...`
   - `QUO_PHONE_NUMBER_ID=PN...`
   - `LEAD_NOTIFY_PHONE=+1...` (E.164 — staff “new lead” texts)

4. Ensure `NEXT_PUBLIC_SITE_URL` is the production URL (links in SMS/email and Quo contact `sourceUrl`).
5. Redeploy ? test with your own mobile as customer ? confirm:
   - Confirmation SMS (copy in `site.config.ts` ? `confirmationSmsTemplate`)
   - Staff alert SMS to `LEAD_NOTIFY_PHONE`
   - Contact in Quo inbox; `quo_contact_id` on lead in admin
6. Use **Retry SMS sync** on lead detail if Quo fails mid-outage.

**Suggested order:** Resend first (email-only alerts), then Quo (B + C SMS).

**Note:** Google Voice is for manual replies during handoff only — no server API. Ongoing customer threads should move to Quo once live.

### Go-live verification

- [ ] Lead in `/admin/leads` with references (if uploaded)
- [ ] Customer confirmation SMS
- [ ] Staff SMS + staff email
- [ ] `communication_logs` show success for SMS + email
- [ ] Privacy copy aligned with transactional SMS before paid traffic
- [ ] Quo / carrier compliance (e.g. US 10DLC) if messages are filtered

## Content & site

- [ ] Finish placeholders in `src/content/site.config.ts` (phone, hours, walk-ins, deposit, age, payment FAQs)
- [ ] Instagram portfolio sync (`npm run sync:instagram`) and commit assets
- [ ] Google reviews: Places API + optional `npm run sync:google-reviews` fallback

## Analytics

- [ ] GA4 + Google Ads: import `quote_completed` as primary conversion ([RUNBOOK.md](./RUNBOOK.md) §6)

## Later (optional)

- Custom domain email only to customers (not in scope today — optional email on form is stored on the lead for staff notifications)
- Alternative SMS provider (Twilio/Telnyx) if shop prefers — would need a new `SmsProvider` implementation; Quo is the only non-mock provider in code today
