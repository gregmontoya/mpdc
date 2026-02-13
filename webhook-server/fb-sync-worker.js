
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID; // Should be act_1255070049702312
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * 🚀 FB ROI SYNC WORKER (Level 99)
 * Pulls daily spend/clicks from Meta and upserts into Supabase.
 */
async function syncFacebookSpend() {
    console.log('🤖 Starting Facebook ROI Sync...');

    if (!FB_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID) {
        console.error('❌ Missing Facebook credentials in .env.local');
        return;
    }

    try {
        // 1. Define Time Range (Last 7 days to account for attribution correction)
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        console.log(`📅 Indexing period: ${sevenDaysAgo} to ${today}`);

        // 2. Fetch Insights from Meta Graph API
        const url = `https://graph.facebook.com/v19.0/${FB_AD_ACCOUNT_ID}/insights` +
            `?access_token=${FB_ACCESS_TOKEN}` +
            `&level=campaign` +
            `&fields=campaign_id,campaign_name,spend,impressions,inline_link_clicks` +
            `&time_increment=1` +
            `&time_range={'since':'${sevenDaysAgo}','until':'${today}'}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            if (data.error.code === 200) {
                console.error('❌ PERMISSION ERROR: Your token is missing "ads_read" scope.');
                console.log('👉 Go to Meta Business Suite -> Settings -> System Users.');
                console.log('👉 Generate a new token for your App with: ads_read, ads_management, business_management.');
            } else {
                console.error('❌ Meta API Error:', data.error.message);
            }
            return;
        }

        const insights = data.data || [];
        console.log(`📊 Received ${insights.length} campaign snapshots from Meta.`);

        // 3. Upsert into Supabase Ad Ledger
        let upsertCount = 0;
        for (const entry of insights) {
            const { error } = await supabase
                .from('campaign_performance')
                .upsert({
                    date: entry.date_start,
                    campaign_id: entry.campaign_id,
                    campaign_name: entry.campaign_name,
                    spend: parseFloat(entry.spend || 0),
                    impressions: parseInt(entry.impressions || 0),
                    clicks: parseInt(entry.inline_link_clicks || 0),
                }, {
                    onConflict: 'date,campaign_id'
                });

            if (error) {
                console.error(`❌ Sync Error for ${entry.date_start} | ${entry.campaign_name}:`, error.message);
            } else {
                upsertCount++;
            }
        }

        console.log(`✅ Success: Updated ${upsertCount} records in the Ad Ledger.`);
        return { success: true, count: upsertCount };

    } catch (error) {
        console.error('❌ Fatal Sync Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Allow manual execution
if (require.main === module) {
    syncFacebookSpend();
}

module.exports = { syncFacebookSpend };
