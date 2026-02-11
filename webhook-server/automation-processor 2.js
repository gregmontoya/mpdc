const { createClient } = require('@supabase/supabase-js');
const AbandonedCart1 = require('./emails/AbandonedCart1');
const NurtureDay3 = require('./emails/NurtureDay3');
const Resend = require('resend').Resend;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * THE AUTOMATION PROCESSOR
 * Runs hourly to check for:
 * 1. Abandoned Carts (1 hour delay)
 * 2. Day 3 Nurture (72 hour delay)
 */
const processAutomations = async () => {
    console.log('🤖 Starting Automation Processing...');
    
    if (!resend) {
        console.error('❌ Resend API Key missing. Automation aborted.');
        return { success: false, error: 'Resend missing' };
    }

    const results = {
        abandoned_cart_sent: 0,
        nurture_day3_sent: 0,
        errors: []
    };

    // -------------------------------------------------------------------------
    // 💳 1. ABANDONED CART (1 HOUR)
    // -------------------------------------------------------------------------
    try {
        const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

        // Find prospects who started checkout > 1hr ago but < 4hr ago
        // and haven't received cart_1 email and haven't purchased
        const { data: abandonedLeads, error: cartError } = await supabase
            .from('contacts')
            .select('*')
            .eq('funnel_stage', 'prospect')
            .is('automation_state->cart_1_sent', null)
            .lt('last_active_at', oneHourAgo);

        if (cartError) throw cartError;

        console.log(`🔍 Found ${abandonedLeads?.length || 0} potential abandoned carts.`);

        for (const lead of (abandonedLeads || [])) {
            console.log(`📧 Sending Abandoned Cart to: ${lead.email}`);
            
            const { error: sendError } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [lead.email],
                subject: 'Wait... did you miss this?',
                html: AbandonedCart1(lead.name)
            });

            if (sendError) {
                console.error(`❌ Error sending to ${lead.email}:`, sendError);
                results.errors.push(`${lead.email}: ${sendError.message}`);
            } else {
                results.abandoned_cart_sent++;
                // Update automation state
                await supabase
                    .from('contacts')
                    .update({ 
                        automation_state: { ...lead.automation_state, cart_1_sent: true, cart_1_at: new Date().toISOString() } 
                    })
                    .eq('email', lead.email);
            }
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
        // and haven't purchased (funnel_stage should still be 'lead' or 'prospect')
        const { data: nurtureLeads, error: nurtureError } = await supabase
            .from('contacts')
            .select('*')
            .neq('funnel_stage', 'student')
            .is('automation_state->nurture_3_sent', null)
            .lt('created_at', seventyTwoHoursAgo);

        if (nurtureError) throw nurtureError;

        console.log(`🔍 Found ${nurtureLeads?.length || 0} leads for Day 3 Nurture.`);

        for (const lead of (nurtureLeads || [])) {
            console.log(`📧 Sending Day 3 Nurture to: ${lead.email}`);
            
            const { error: sendError } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [lead.email],
                subject: 'The Choice (Day 3)',
                html: NurtureDay3(lead.name)
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
                        automation_state: { ...lead.automation_state, nurture_3_sent: true, nurture_3_at: new Date().toISOString() } 
                    })
                    .eq('email', lead.email);
            }
        }
    } catch (e) {
        console.error('❌ Nurture Day 3 Process Error:', e.message);
        results.errors.push(`Nurture Error: ${e.message}`);
    }

    console.log('✅ Automation Processing Complete.');
    console.log(results);
    return results;
};

module.exports = { processAutomations };
