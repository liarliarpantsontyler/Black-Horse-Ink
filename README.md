# Black Horse Ink

Mobile-first tattoo studio acquisition site — quote by text, Supabase leads, Quo-ready SMS.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed in the terminal (usually [http://localhost:3000](http://localhost:3000)). If port 3000 is already in use, Next.js picks the next free port (e.g. **3001**) — that URL is the one for this project.

## Docs

- [ROADMAP.md](./ROADMAP.md) — what's next (Quo, Resend, content, analytics)
- [RUNBOOK.md](./RUNBOOK.md) — deploy, Supabase, Quo, GA4/Ads handoff
- [scripts/README.md](./scripts/README.md) — Instagram portfolio sync

## Key paths

- `src/content/site.config.ts` — studio copy, artists (Lucia → Juan → Marcos), FAQs
- `src/content/portfolio.generated.json` — gallery (from sync or placeholders)
- `src/app/api/leads/route.ts` — quote submission pipeline
