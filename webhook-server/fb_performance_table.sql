-- 🚀 FB PERFORMANCE TABLE (Level 99 CRM)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS campaign_performance (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    date date NOT NULL,
    campaign_id text NOT NULL,
    campaign_name text,
    spend decimal(10,2) DEFAULT 0,
    impressions int DEFAULT 0,
    clicks int DEFAULT 0,
    created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(date, campaign_id)
);

-- Enable RLS
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- Allow everything for service role (Internal Sync)
CREATE POLICY "Enable all access for service role" ON campaign_performance FOR ALL USING (true);
