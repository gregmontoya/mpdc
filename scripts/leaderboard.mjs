
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vobbqsipyyftscyvxuja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function showLeaderboard() {
    console.log('🏆 CRM ENGAGEMENT LEADERBOARD 🏆');
    console.log('---------------------------------');

    const { data: leads, error } = await supabase
        .from('contacts')
        .select('name, email, engagement_score, funnel_stage, last_active_at')
        .order('engagement_score', { ascending: false })
        .limit(15);

    if (error) {
        console.error('❌ Error fetching leaderboard:', error.message);
        return;
    }

    leads.forEach((lead, index) => {
        const score = lead.engagement_score || 0;
        const flame = score >= 10 ? '🔥' : (score > 0 ? '⚡' : '❄️');
        console.log(`${index + 1}. [${score}] ${flame} ${lead.name || 'Anonymous'} (${lead.email})`);
        console.log(`   Stage: ${lead.funnel_stage} | Last Active: ${lead.last_active_at ? new Date(lead.last_active_at).toLocaleString() : 'Never'}`);
        console.log('---');
    });
}

showLeaderboard();
