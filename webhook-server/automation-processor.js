const Day1Identity = require('./emails/Day1Identity');
const Day2Submission = require('./emails/Day2Submission');
const Day3Biology = require('./emails/Day3Biology');
const Day4Legacy = require('./emails/Day4Legacy');
const Day5Binary = require('./emails/Day5Binary');
const AbandonedCart1 = require('./emails/AbandonedCart1');
const { createClient } = require('@supabase/supabase-js');
const Resend = require('resend').Resend;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase = (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY))
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)
    : null;

/**
 * THE AUTOMATION PROCESSOR
 * Runs hourly to check for:
 * 1. Abandoned Carts (20 min delay)
 * 2. 5-Day Logic-First Nurture Sequence
 */
const processAutomations = async () => {
    console.log('🤖 Starting Automation Processing...');

    if (!resend || !supabase) {
        console.error('❌ Resend or Supabase configuration missing. Automation aborted.');
        return { success: false, error: 'Configuration missing' };
    }

    const results = {
        abandoned_cart_sent: 0,
        nurture_day3_sent: 0,
        errors: []
    };

    // -------------------------------------------------------------------------
    // 💳 1. ABANDONED CART (After 20 mins)
    // -------------------------------------------------------------------------
    try {
        const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();

        // Find prospects who started checkout > 20 mins ago
        // and haven't received abandon email and haven't purchased
        const { data: abandonedLeads, error: cartError } = await supabase
            .from('contacts')
            .select('*')
            .eq('funnel_stage', 'prospect')
            .lt('last_active_at', twentyMinsAgo);

        if (cartError) throw cartError;

        console.log(`🔍 Found ${abandonedLeads?.length || 0} potential abandoned carts.`);

        for (const lead of (abandonedLeads || [])) {
            // Check both flag variations
            if (lead.automation_state?.abandoned_sent || lead.automation_state?.cart_1_sent) continue;

            console.log(`📧 Sending Abandoned Cart to: ${lead.email}`);

            const { error: sendError } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [lead.email],
                subject: 'Don\'t let the loop win (Complete your comeback)',
                html: AbandonedCart1(lead.name || '', lead.email)
            });

            if (sendError) {
                console.error(`❌ Error sending to ${lead.email}:`, sendError);
                results.errors.push(`${lead.email}: ${sendError.message}`);
            } else {
                results.abandoned_cart_sent++;
                // Update automation state (Sync with index.js flag)
                await supabase
                    .from('contacts')
                    .update({
                        automation_state: { ...lead.automation_state, abandoned_sent: true, abandoned_sent_at: new Date().toISOString() }
                    })
                    .eq('email', lead.email);
            }

            // Respect rate limits (2 req/sec)
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    } catch (e) {
        console.error('❌ Abandoned Cart Process Error:', e.message);
        results.errors.push(`Cart Error: ${e.message}`);
    }

    // -------------------------------------------------------------------------
    // 🛡️ 2. THE 5-DAY NURTURE SEQUENCE (Logic-First)
    // -------------------------------------------------------------------------
    try {
        const now = new Date();
        const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

        // 🎯 OPTIMIZATION: Only fetch contacts from the last 10 days 
        // who aren't students. This prevents the "Whole Database Fetch" crash.
        const { data: prospects, error: prospectError } = await supabase
            .from('contacts')
            .select('*')
            .neq('funnel_stage', 'student')
            .gt('created_at', tenDaysAgo)
            .limit(50); // Hard limit per run to prevent Vercel timeout

        if (prospectError) throw prospectError;

        console.log(`🔍 Processing sequence for ${prospects?.length || 0} recent prospects.`);

        let emailsSentThisRun = 0;
        const MAX_EMAILS_PER_RUN = 15; // Safe limit for Vercel 10s timeout

        for (const lead of (prospects || [])) {
            if (emailsSentThisRun >= MAX_EMAILS_PER_RUN) {
                console.log('⏳ Batch limit reached for this hour. Continuing next run.');
                break;
            }

            const joinedAt = new Date(lead.created_at);
            const hoursSinceJoined = (now - joinedAt) / (1000 * 60 * 60);
            const state = lead.automation_state || {};

            let template = null;
            let stepKey = '';
            let subject = '';

            // Day 1: Identity Murder (24h)
            if (hoursSinceJoined >= 24 && !state.seq_d1_sent) {
                template = Day1Identity;
                stepKey = 'seq_d1_sent';
                subject = 'The version of you she devalued... should die.';
            }
            // Day 2: Submission Trap (48h)
            else if (hoursSinceJoined >= 48 && !state.seq_d2_sent) {
                template = Day2Submission;
                stepKey = 'seq_d2_sent';
                subject = 'Stop explaining. You’re losing.';
            }
            // Day 3: Biological Ghost (72h)
            else if (hoursSinceJoined >= 72 && !state.seq_d3_sent) {
                template = Day3Biology;
                stepKey = 'seq_d3_sent';
                subject = 'Why you can’t "think" your way out of this.';
            }
            // Day 4: Legacy Warning (96h)
            else if (hoursSinceJoined >= 96 && !state.seq_d4_sent) {
                template = Day4Legacy;
                stepKey = 'seq_d4_sent';
                subject = 'Your sons are watching.';
            }
            // Day 5: Binary Choice (120h)
            else if (hoursSinceJoined >= 120 && !state.seq_d5_sent) {
                template = Day5Binary;
                stepKey = 'seq_d5_sent';
                subject = 'One last check.';
            }

            if (template && stepKey) {
                console.log(`📧 Sending ${stepKey} to: ${lead.email}`);

                const { error: sendError } = await resend.emails.send({
                    from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                    to: [lead.email],
                    subject: subject,
                    html: template(lead.name || '')
                });

                if (sendError) {
                    console.error(`❌ Error sending ${stepKey} to ${lead.email}:`, sendError);
                } else {
                    emailsSentThisRun++; // 📈 Increment counter
                    results.nurture_day3_sent++; // Reusing counter for summary
                    await supabase
                        .from('contacts')
                        .update({
                            automation_state: { ...state, [stepKey]: true, [`${stepKey}_at`]: now.toISOString() }
                        })
                        .eq('email', lead.email);
                }

                await new Promise(resolve => setTimeout(resolve, 600));
            }
        }
    } catch (e) {
        console.error('❌ Nurture Sequence Error:', e.message);
        results.errors.push(`Sequence Error: ${e.message}`);
    }

    console.log('✅ Automation Processing Complete.');
    return results;
};

module.exports = { processAutomations };
