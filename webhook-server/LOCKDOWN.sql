/* 
  🔒 MPDC SOVEREIGN LOCKDOWN - EMERGENCY FIX
  Date: Feb 27, 2026
  Action: Run this in your Supabase SQL Editor immediately.
*/

-- 1. DROP DANGEROUS PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Enable all access for service role" ON leads;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON contacts;
DROP POLICY IF EXISTS "Enable all access for service role" ON visitor_activity;
DROP POLICY IF EXISTS "Enable all access for service role" ON activity_logs;
DROP POLICY IF EXISTS "Enable all access for service role" ON campaign_performance;

-- 2. ENABLE RLS (Guaranteeing the door is locked)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SECURE SERVICE-ROLE-ONLY POLICIES
-- This ensures ONLY the secure Webhook Server (Vercel) can touch this data.
-- The public 'anon' key (exposed in your frontend) will now return 0 results.
CREATE POLICY "Service Role Access Only" ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Access Only" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Access Only" ON contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Access Only" ON visitor_activity FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Access Only" ON activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Access Only" ON campaign_performance FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. VERIFY SYSTEM
-- To test this: Try fetching leads via curl with your anon key. 
-- It should now return an empty array instead of your data.
