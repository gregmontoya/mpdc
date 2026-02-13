# 🚀 Level 99 Facebook ROI Sync: Implementation Plan

To build a professional-grade Performance Marketing Engine, we aren't just "connecting an API." We are building a **Source of Truth** that allows us to make million-dollar decisions with zero doubt.

Here is the 4-Step Blueprint for a perfect implementation.

---

### Phase 1: The Tactical Database (Foundation)
**Current Problem:** Your leads are in Supabase, but your spend is "in your head" or in a manual input.
**Professional Solution:** We create a `campaign_performance` table in Supabase. This acts as our "Ad Ledger."
- **Fields:** `date`, `campaign_id`, `campaign_name`, `spend`, `impressions`, `clicks`.
- **Primary Key:** `date + campaign_id` (Ensures we never double-count or miss a day).

### Phase 2: The Marketing API Bridge (Extraction)
**Current Problem:** Fetching data live from Meta is slow and prone to timeouts.
**Professional Solution:** Build a robust Node.js worker that:
1. Authenticates with Meta using your `FB_ACCESS_TOKEN`.
2. Requests "Time-Series" data (Daily breakdown).
3. Pulls data for the last 7 days to ensure "Attribution Correction" (Facebook often updates spend/clicks 24-48 hours after they happen).

### Phase 3: The Attribution Join (Intelligence)
**Current Problem:** Knowing you spent $100 is useless if you don't know which leads it bought.
**Professional Solution:** We create a "Unified ROI View" that:
1. Joins `campaign_performance` (Meta Spend) with `contacts` (Stripe Revenue).
2. Uses a **Fuzzy Mapping** system: It matches `utm_campaign` in your lead tags to the `campaign_name` from the API.

### Phase 4: Automation & Velocity Alerts (The "Pro" Edge)
**Current Problem:** You have to look at the dashboard to see if an ad is failing.
**Professional Solution:**
- **ROAS Alerts:** If a campaign's ROAS drops below 1.0 (Losing money), the engine sends an **URGENT SLACK NOTIFICATION**.
- **The Scaler:** If a campaign has a ROAS > 3.0 and has spent > $100, the engine marks it as a "Winner" in the CRM.

---

### 🛠️ What I Need to Start:
To fetch your spend, I need your **Facebook Ad Account ID**. 
1. Go to your **Facebook Ads Manager**.
2. Look at the URL. You will see `act=xxxxxxxxxxxxxxx`.
3. That number is your Ad Account ID.

### 🏁 Step 1 (Action Required):
**Should I start by creating the Database Ledger (Phase 1) while you get that Ad Account ID?**
