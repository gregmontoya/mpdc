const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: './.env.local' });

// Config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_PIXEL_ID = process.env.FB_PIXEL_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function hashData(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(String(data).toLowerCase().trim()).digest('hex');
}

async function syncToFacebook() {
    console.log('🚀 Starting Facebook Conversions API (CAPI) Sync...');

    try {
        // 1. Fetch "Student" conversions from the last 24 hours
        // In a real scenario, you'd use the 'fb_synced_at' flag we discussed,
        // but for this MVP, we'll sync anyone who became a student recently.
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: students, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('funnel_stage', 'student')
            .gte('created_at', oneDayAgo);

        if (error) throw error;
        if (!students || students.length === 0) {
            console.log('ℹ️ No new students found to sync in the last 24 hours.');
            return;
        }

        console.log(`📡 Found ${students.length} new student(s). Sending to Facebook...`);

        // 2. Prepare CAPI Events
        const events = students.map(student => {
            const userData = {
                em: [hashData(student.email)],
            };

            if (student.name) {
                const names = student.name.split(' ');
                userData.fn = [hashData(names[0])];
                if (names.length > 1) userData.ln = [hashData(names[names.length - 1])];
            }

            // Client IP/UserAgent would be better if captured at lead time, 
            // but we'll send what we have (ID-based matching)
            return {
                event_name: 'Purchase',
                event_time: Math.floor(new Date(student.created_at).getTime() / 1000),
                action_source: 'website',
                user_data: userData,
                custom_data: {
                    value: 27.00,
                    currency: 'USD',
                    content_name: 'Student Membership'
                }
            };
        });

        // 3. Post to Facebook
        const fbUrl = `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`;
        const response = await axios.post(fbUrl, { data: events });

        console.log('✅ Facebook CAPI Response:', response.data);
        console.log(`🎯 Successfully synced ${students.length} conversion(s) to Facebook AI.`);

    } catch (err) {
        console.error('❌ CAPI Sync Error:', err.response ? err.response.data : err.message);
    }
}

syncToFacebook();
