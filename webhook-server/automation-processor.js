const { createClient } = require('@supabase/supabase-js');
const AbandonedCart1 = require('./emails/AbandonedCart1');
const NurtureDay3 = require('./emails/NurtureDay3');
const Resend = require('resend').Resend;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase = (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY))
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)
    : null;

/**
 * THE AUTOMATION PROCESSOR
 * Runs hourly to check for:
 * 1. Abandoned Carts (1 hour delay)
 * 2. Day 3 Nurture (72 hour delay)
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
    // 🌱 2. NURTURE DAY 3 (72 HOURS)
    // -------------------------------------------------------------------------
    try {
        const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

        // Find leads who joined > 72h ago and haven't received nurture_3
        const { data: nurtureLeads, error: nurtureError } = await supabase
            .from('contacts')
            .select('*')
            .neq('funnel_stage', 'student')
            .lt('created_at', seventyTwoHoursAgo);

        if (nurtureError) throw nurtureError;

        console.log(`🔍 Found ${nurtureLeads?.length || 0} leads for Day 3 Nurture.`);

        for (const lead of (nurtureLeads || [])) {
            if (lead.automation_state?.nurture_d3_sent || lead.automation_state?.nurture_3_sent) continue;

            console.log(`📧 Sending Day 3 Nurture to: ${lead.email}`);

            const { error: sendError } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [lead.email],
                subject: 'Reclaiming your Frame (MPDC Method)',
                html: NurtureDay3(lead.name || '', lead.email)
            });

            if (sendError) {
                console.error(`❌ Error sending to ${lead.email}:`, sendError);
                results.errors.push(`${lead.email}: ${sendError.message}`);
            } else {
                results.nurture_day3_sent++;
                // Update automation state
                await supabase
                    .from('contacts')
                    .update({
                        automation_state: { ...lead.automation_state, nurture_d3_sent: true, nurture_d3_date: new Date().toISOString() }
                    })
                    .eq('email', lead.email);
            }

            // Respect rate limits
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    } catch (e) {
        console.error('❌ Nurture Day 3 Process Error:', e.message);
        results.errors.push(`Nurture Error: ${e.message}`);
    }

    console.log('✅ Automation Processing Complete.');
    return results;
};

module.exports = { processAutomations };
