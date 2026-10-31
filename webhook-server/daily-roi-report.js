const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const axios = require('axios');
const crypto = require('crypto');

async function generateReport() {
    // Config - Try to get from process.env (Vercel) or .env.local
    const SUPABASE_URL = process.env.SUPABASE_URL;
    // Use the Service Role Key for backend reporting to bypass RLS
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RECIPIENT_EMAIL = ['gregmontoya1@gmail.com', 'amorganatm@gmail.com'];

    if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
        console.error('❌ Missing Reporting Credentials:', {
            hasUrl: !!SUPABASE_URL,
            hasKey: !!SUPABASE_KEY,
            hasResend: !!RESEND_API_KEY
        });
        return { success: false, error: 'Missing Credentials' };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    console.log('🚀 Starting Daily ROI Report Generation...');

    try {
        // 1. Fetch Data
        const [contactsRes, performanceRes] = await Promise.all([
            supabase.from('contacts').select('*'),
            supabase.from('campaign_performance').select('*')
        ]);

        if (contactsRes.error) throw contactsRes.error;
        if (performanceRes.error) throw performanceRes.error;

        const contacts = contactsRes.data || [];
        const performance = performanceRes.data || [];

        // 2. Process Performance (Spend)
        const campaignStats = {};
        const normalize = (val) => String(val || '').toLowerCase().replace(/[\s_-]/g, '').trim();

        performance.forEach(row => {
            const id = String(row.campaign_id || '').trim();
            const name = row.campaign_name || 'Unknown Campaign';
            const nameKey = normalize(name);
            const key = id || nameKey;

            if (!campaignStats[key]) {
                campaignStats[key] = { id, name, nameKey, leads: 0, buyers: 0, revenue: 0, spend: 0 };
            }
            campaignStats[key].spend += parseFloat(row.spend || 0);
        });

        // 3. Process Contacts (Revenue/Leads)
        const creatives = {};
        let totalRevenue = 0;
        let totalLeadsInDB = contacts.length;

        contacts.forEach(lead => {
            const attr = lead.attribution || {};
            const lastTouch = attr.last_touch || {};
            const utmId = String(lastTouch.utm_id || lastTouch.utm_id_long || '').trim();
            const utmCamp = lastTouch.utm_campaign || (attr.import_source ? `Import: ${attr.import_source}` : 'Direct / Organic');
            const utmContent = lastTouch.utm_content || 'N/A';
            const nameKey = normalize(utmCamp);

            let key = utmId && campaignStats[utmId] ? utmId : null;
            if (!key) {
                key = Object.keys(campaignStats).find(k =>
                    campaignStats[k].nameKey === nameKey ||
                    (nameKey.length > 3 && (campaignStats[k].nameKey.includes(nameKey) || nameKey.includes(campaignStats[k].nameKey)))
                );
            }
            key = key || utmId || nameKey;

            if (!campaignStats[key]) {
                campaignStats[key] = { id: utmId, name: utmCamp, nameKey, leads: 0, buyers: 0, revenue: 0, spend: 0 };
            }

            const isBuyer = lead.funnel_stage === 'student';
            const rev = isBuyer ? 27 : 0;

            campaignStats[key].leads++;
            if (isBuyer) campaignStats[key].buyers++;
            campaignStats[key].revenue += rev;
            totalRevenue += rev;

            if (!creatives[utmContent]) creatives[utmContent] = { revenue: 0, leads: 0, buyers: 0 };
            creatives[utmContent].revenue += rev;
            creatives[utmContent].leads++;
            if (isBuyer) creatives[utmContent].buyers++;
        });

        // 4. Group by Channel
        const channels = {
            "Facebook Ads": [],
            "Organic / Social": [],
            "Legacy Imports": []
        };

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let dailyLeads = 0;
        let dailySales = 0;

        contacts.forEach(c => {
            if (new Date(c.created_at) > oneDayAgo) {
                dailyLeads++;
                if (c.funnel_stage === 'student') dailySales++;
            }
        });

        // Calculate Daily Spend (Most recent date in performance)
        const recentDate = performance.reduce((max, p) => p.date > max ? p.date : max, '');
        const dailySpend = performance.filter(p => p.date === recentDate).reduce((sum, p) => sum + parseFloat(p.spend || 0), 0);

        Object.keys(campaignStats).forEach(key => {
            const c = campaignStats[key];
            if (c.leads === 0 && c.spend === 0) return;

            let channel = "Organic / Social";
            if (c.spend > 0 || c.id || c.name.includes('[PROSP]') || c.name.includes('Boost Post')) {
                channel = "Facebook Ads";
            } else if (c.name.includes('Import:')) {
                channel = "Legacy Imports";
            }
            channels[channel].push(c);
        });

        // 5. Generate HTML Email
        let reportHtml = `
            <div style="font-family: sans-serif; max-width: 950px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b;">
                <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; color: white; margin-bottom: 24px;">
                    <h1 style="margin: 0; font-size: 24px;">📊 Daily Campaign Intelligence</h1>
                    <p style="margin: 8px 0 0; opacity: 0.7;">Analyzing ${totalLeadsInDB} Unique Profiles</p>
                </div>

                <!-- Daily Intelligence Snapshot -->
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">🚀 Last 24 Hours Summary</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #dbeafe;">
                            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Daily Leads</span>
                            <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${dailyLeads}</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #dbeafe;">
                            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Daily Sales</span>
                            <div style="font-size: 20px; font-weight: 800; color: #10b981;">${dailySales}</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #dbeafe;">
                            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Reported Spend</span>
                            <div style="font-size: 20px; font-weight: 800; color: #1e293b;">$${dailySpend.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 13px; color: #64748b; text-transform: uppercase;">Total Revenue</span>
                        <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 4px;">$${totalRevenue}</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 13px; color: #64748b; text-transform: uppercase;">Avg Lead Value</span>
                        <div style="font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 4px;">$${(totalRevenue / (totalLeadsInDB || 1)).toFixed(2)}</div>
                    </div>
                </div>

                <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f1f5f9;">
                            <tr>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Campaign</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Leads</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Revenue</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Spend</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">CPL</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">CPA</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Profit</th>
                                <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">ROAS</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        Object.keys(channels).forEach(channelName => {
            const items = channels[channelName];
            if (items.length === 0) return;

            reportHtml += `
                <tr style="background: #f8fafc;">
                    <td colspan="8" style="padding: 10px 12px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                        ${channelName}
                    </td>
                </tr>
            `;

            items.sort((a, b) => b.leads - a.leads).forEach(c => {
                const spend = c.spend || 0;
                const cpl = c.leads > 0 ? (spend / c.leads).toFixed(2) : '---';
                const cpa = c.buyers > 0 ? (spend / c.buyers).toFixed(2) : '---';
                const net = (c.revenue - spend).toFixed(2);
                const roas = spend > 0 ? (c.revenue / spend).toFixed(2) : (c.revenue > 0 ? '∞' : '---');

                reportHtml += `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 600;">${c.name}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">${c.leads}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 600; color: ${c.revenue > 0 ? '#10b981' : '#1e293b'};">$${c.revenue}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #64748b;">$${spend.toFixed(2)}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">$${cpl}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: ${cpa !== '---' && parseFloat(cpa) <= 27 ? '#10b981' : '#ef4444'}; font-weight: bold;">${cpa !== '---' ? '$' + cpa : '---'}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: ${net >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">${net >= 0 ? '+' : ''}$${net}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">
                            <span style="background: ${roas > 1.5 ? '#f0fdf4' : '#f8fafc'}; color: ${roas > 1.5 ? '#166534' : '#475569'}; padding: 4px 8px; border-radius: 99px; font-weight: bold;">
                                ${roas}${roas !== '---' && roas !== '∞' ? 'x' : ''}
                            </span>
                        </td>
                    </tr>
                `;
            });
        });

        reportHtml += `
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 30px; margin-bottom: 24px;">
                    <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 12px;">🏆 Creative Hook Analysis</h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                        ${(() => {
                const creativeEntries = Object.entries(creatives).map(([name, data]) => ({
                    name,
                    ...data,
                    cr: data.leads > 0 ? (data.buyers / data.leads) * 100 : 0
                }));
                const winner = creativeEntries.filter(c => c.buyers > 0).sort((a, b) => b.cr - a.cr)[0];
                const sorted = creativeEntries.sort((a, b) => b.leads - a.leads).slice(0, 3);

                return sorted.map(c => {
                    const isWinner = winner && c.name === winner.name;
                    return `
                                    <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid ${isWinner ? '#10b981' : '#e2e8f0'}; position: relative;">
                                        ${isWinner ? '<span style="position: absolute; top: 10px; right: 10px; background: #10b981; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">WINNER</span>' : ''}
                                        <div style="font-weight: bold; font-size: 14px; color: ${isWinner ? '#10b981' : '#0f172a'};">${c.name}</div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                                            ${c.leads} leads • ${c.cr.toFixed(1)}% Conversion Rate
                                        </div>
                                    </div>
                                `;
                }).join('');
            })()}
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                    <p>Generated by Alex Morgan for MPDC Intelligence.</p>
                    <p>To view the live dashboard, go to <a href="https://menspostdivorcecoaching.com/crm/roi" style="color: #6366f1; text-decoration: none;">CRM ROI Panel</a></p>
                </div>
            </div>
        `;

        // 6. Send Email
        console.log(`📪 Sending report to ${RECIPIENT_EMAIL}...`);
        const { data, error } = await resend.emails.send({
            from: 'Alex Morgan <reports@menspostdivorcecoaching.com>',
            to: RECIPIENT_EMAIL,
            subject: `📊 MPDC Paid Media ROI Report - ${new Date().toLocaleDateString()} `,
            html: reportHtml
        });

        if (error) {
            console.error('❌ Resend Error:', error);
            return { success: false, error };
        } else {
            console.log('✅ Daily Report Sent Successfully!', data);
        }

        // 7. Facebook CAPI Sync
        console.log('🚀 Syncing conversions to Facebook AI...');
        try {
            // FETCH RECENT STUDENTS (Last 7 days - FB limited window)
            console.log('📡 Fetching recent students for Facebook CAPI training...');
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { data: students } = await supabase
                .from('contacts')
                .select('*')
                .eq('funnel_stage', 'student')
                .gt('created_at', sevenDaysAgo);

            if (students && students.length > 0) {
                console.log(`🎯 Found ${students.length} students total. Syncing to Facebook AI...`);
                const hash = (d) => crypto.createHash('sha256').update(String(d || '').toLowerCase().trim()).digest('hex');
                const events = students.map(s => ({
                    event_name: 'Purchase',
                    event_time: Math.floor(new Date(s.created_at).getTime() / 1000),
                    action_source: 'website',
                    user_data: { em: [hash(s.email)] },
                    custom_data: { value: 27.00, currency: 'USD', content_name: 'Student Membership' },
                    event_id: `purchase_${s.id}` // Deduplication safety
                }));
                const response = await axios.post(`https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`, { data: events });
                console.log(`✅ Facebook CAPI Response:`, response.data);
                console.log(`🎯 Successfully synced ${students.length} conversions to Facebook Intelligence.`);
            } else {
                console.log('ℹ️ No students found in database to sync.');
            }
        } catch (capiErr) {
            console.error('⚠️ FB CAPI Sync failed, but report was sent:', capiErr.message);
        }

        // 8. Slack "Winner" Alerts (NEW)
        const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
        if (SLACK_WEBHOOK_URL) {
            console.log('📢 Checking for Winning Campaigns to announce in Slack...');
            const winners = Object.values(campaignStats).filter(c =>
                c.spend > 20 && (c.revenue / c.spend) > 1.8
            );

            for (const c of winners) {
                const roas = (c.revenue / c.spend).toFixed(2);
                const blocks = [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: "🔥 SCALE ALERT: Ad Winner Detected!",
                            emoji: true
                        }
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Campaign:* ${c.name}\n*ROAS:* ${roas}x | *Revenue:* $${c.revenue} | *Spend:* $${c.spend.toFixed(2)}`
                        }
                    },
                    {
                        type: "context",
                        elements: [{
                            type: "mrkdwn",
                            text: "💡 *Recommendation:* Increase daily budget by 20% to scale this winner."
                        }]
                    }
                ];

                await axios.post(SLACK_WEBHOOK_URL, { blocks }).catch(err => console.error('Slack Alert Error:', err.message));
            }
        }

        return { success: true, data };

    } catch (err) {
        console.error('❌ Error executing report:', err);
        return { success: false, error: err.message };
    }
}

// Allow standalone execution for local testing
if (require.main === module) {
    require('dotenv').config({ path: './.env.local' });
    generateReport().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { generateReport };
