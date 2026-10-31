# 🛡️ MPDC Sovereign Security Protocol

## 🚨 MISSION CRITICAL: Security-First Development
This document serves as the absolute source of truth for all code generation and system architecture within the MPDC ecosystem. **Security is not a feature; it is the foundation.**

---

### 1. Database Security (Supabase/PostgreSQL)
*   **NEVER** disable Row Level Security (RLS).
*   **NEVER** use `USING (true)` for public (`anon`) policies.
*   **ALWAYS** use strict `TO service_role` or `TO authenticated` clauses.
*   **POLICY AUDIT**: Every new table must have a corresponding RLS policy defined in `db_schema.sql`.

### 2. Secret Management
*   **CLIENT-SIDE ZERO-TRUST**: No sensitive API keys (Stripe Secret, Supabase Service Role, Firebase Private Key) may ever exist in a file served to the browser.
*   **ENV VARS ONLY**: Use `.env.local` for local development and Vercel/Firebase dashboard for production variables.
*   **PROXY PATTERN**: If the frontend needs data from a secure database, it must request it through an Astro API route (`src/pages/api/...`) which performs the authentication on the server.

### 3. Authentication & Access
*   **IP LOCKING**: Admin dashboards (CRM) must be protected by more than a simple password. Use Firebase Auth with specific allowed UID/Emails.
*   **ENCRYPTION**: Any sensitive PII (Personally Identifiable Information) in transition must be over HTTPS.

---

## 🛠️ Mandatory Pre-Commit Checklist
Before finalizing any task, Antigravity must audit:
1. [ ] Are there any hardcoded keys in the frontend?
2. [ ] Does the SQL for new tables include `ENABLE ROW LEVEL SECURITY`?
3. [ ] If I am fetching data, is there a server-side "Gatekeeper" in place?
4. Backend Authority
    - All backend scripts (webhooks, reporting, crons) **MUST** use the `SUPABASE_SERVICE_ROLE_KEY`.
    - Using the `anon` key on the backend will fail because RLS locks the data from public view.
    - When enabling RLS, immediately verify that the Daily Pulse and CRM proxies are still functional.
5. [ ] Is the "Vibe Coding" shortcut (disabling security to fix a bug) being used? (If yes, STOP and fix the permission properly).

---
*Last Updated: Feb 27, 2026*
