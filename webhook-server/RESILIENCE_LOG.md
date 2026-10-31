# 🛠️ Dashboard & Automation Resilience Log

This document records the architectural shifts made to ensure the MPDC Marketing Engine remains stable as the lead list grows.

## 🚨 Problem: The "Vercel Execution Wall" (Feb 24, 2026)
As the lead list grew (>150 leads), the `daily-pulse` cron job began failing.
- **Root Cause:** Vercel Hobby plan has a **10-second timeout**. 
- **Conflict:** The engine was trying to process the entire nurture sequence *before* generating the ROI report. The safety delays in the email loop (0.6s/email) meant that after ~15 leads, the 10s limit was hit, killing the process before the ROI report could even start.
- **Result:** Daily emails stopped arriving, and the automation sequence was stuck in a loop of unfinished tasks.

## 🏗️ Architectural Solutions Implemented

### 1. ROI Prioritization (The "Data First" Rule)
The order of operations in `daily-pulse` was flipped.
- **Before:** Automation -> FB Sync -> ROI Report
- **After:** **ROI Report** -> FB Sync -> Automation
- **Why:** This ensures Greg gets his high-leverage data in his inbox within the first 3 seconds of the cron run, regardless of how long the secondary automations take.

### 2. Logic-First Batching (Scaling Response)
The `automation-processor.js` was modified to move from "Database-Wide Process" to "Batched Process."
- **Constraint:** Added `MAX_EMAILS_PER_RUN = 15`.
- **Constraint:** Added a **10-day look-back window** for prospect processing.
- **Why:** Since the cron runs hourly, the sequence will "drain" the queue naturally without ever exceeding the 10-second Vercel timeout. This prevents the "Success Crash" where a larger list breaks the server.

### 3. Attribution Intelligence Tiering
Improved the logic in `src/pages/crm/roi.astro` to ensure revenue is mapped accurately without hardcoded keys.
- **Tier 1:** Exact `utm_id` match.
- **Tier 2:** Fuzzy name matching (handling slight variations in campaign names).
- **Tier 3:** Fallback to attribution source or "Organic".

### 4. Code Resilience Fixes
- **Day 4 Crash:** Found and fixed a typo where `Day4LegacyWarning` was called instead of the exported `Day4Legacy` template.
- **Security:** Removed hardcoded Supabase keys from the client-side ROI dashboard and replaced them with `import.meta.env` lookups.

## 📊 Monitoring for Greg
If the daily emails stop, check:
1. **Vercel Logs:** Look for "Function Timeout" in the `/api/cron/daily-pulse` path.
2. **Resend Dashboard:** Check if the Monthly Send Limit has been reached.
3. **Supabase:** Ensure the `campaign_performance` table hasn't hit a row limit.

---
*Log entry by Antigravity AI - Feb 24, 2026*
