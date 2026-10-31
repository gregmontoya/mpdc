# MPDC Project Architecture & Guidelines for Jules

## Overview
- **Project:** Men's Post-Divorce Coaching (MPDC)
- **Live Custom Domain:** https://menspostdivorcecoaching.com
- **Hosting:** GitHub Pages with automated CI/CD via `.github/workflows/deploy.yml`
- **Framework:** Astro (Static Site Generation `output: 'static'`)
- **Database:** Firebase Firestore (`mpdc-website-32dae`)
- **CRM Portal:** `/crm` (Protected by gateway, connects to Firestore `prospects` and `profiles`)
- **Backend & Webhooks:** `webhook-server/` (Node.js Express on Vercel handling Stripe payments and Resend transactional emails)

## Security & Coding Standards
1. **Secrets:** Never commit `.env*`, service account keys, or raw API tokens. Use `process.env` everywhere.
2. **Database:** Supabase is completely deprecated in favor of unified Firebase Firestore. Do not re-introduce Supabase dependencies.
3. **Build:** Static build must succeed with `npm run build` without server-side header dependencies on prerendered pages.
4. **Styles & Assets:** Tailwind CSS with custom branding (`#0B3B36`, `#071F1D`, `#D4AF37`).
