const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

async function sendLeaderboardToSlack() {
    console.log('🏆 Generating Slack Leaderboard...');

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

    if (!SUPABASE_URL || !SUPABASE_KEY || !SLACK_WEBHOOK_URL) {
        console.error('❌ Missing Leaderboard Credentials');
        return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        const { data: leads, error } = await supabase
            .from('contacts')
            .select('name, email, engagement_score, funnel_stage, last_active_at')
            .order('engagement_score', { ascending: false })
            .limit(10);

        if (error) throw error;

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🏆 MPDC Lead Leaderboard",
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "These are your *Top 10 Most Engaged* potential students right now. Strike while the iron is hot!"
                }
            },
            {
                type: "divider"
            }
        ];

        leads.forEach((lead, index) => {
            const score = lead.engagement_score || 0;
            const flame = score >= 20 ? '🔥' : (score >= 10 ? '⚡' : '✨');
            const timeAgo = lead.last_active_at ? `Active ${new Date(lead.last_active_at).toLocaleDateString()}` : 'Idle';

            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `${index + 1}. *${lead.name || 'Anonymous'}* (${lead.email})\n*Score: ${score} ${flame}* | Stage: ${lead.funnel_stage} | ${timeAgo}`
                }
            });
        });

        blocks.push({
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text: "📊 Generated daily at 10 AM by Alex Morgan"
                }
            ]
        });

        await axios.post(SLACK_WEBHOOK_URL, { blocks });
        console.log('✅ Leaderboard sent to Slack');

    } catch (err) {
        console.error('❌ Leaderboard Sync Error:', err.message);
    }
}

module.exports = { sendLeaderboardToSlack };
