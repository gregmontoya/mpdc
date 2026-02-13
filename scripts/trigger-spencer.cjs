
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../webhook-server/.env.local') });

const AbandonedCart1 = require('../webhook-server/emails/AbandonedCart1');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

const email = 'spencer.lambdin@gmail.com';

async function sendManualAbandonedCart() {
    console.log(`🚀 Manually triggering abandoned cart email for: ${email}`);

    // 1. Fetch lead data
    const { data: lead, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', email)
        .single();

    if (fetchError || !lead) {
        console.error('❌ Could not find lead:', fetchError?.message);
        return;
    }

    if (lead.automation_state?.abandoned_sent || lead.automation_state?.cart_1_sent) {
        console.log('ℹ️ Email already marked as sent in automation_state. Skipping to avoid double email.');
        return;
    }

    // 2. Send Email
    try {
        const { data, error: sendError } = await resend.emails.send({
            from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
            to: [email],
            subject: 'Don\'t let the loop win (Complete your comeback)',
            html: AbandonedCart1(lead.name || 'there', email)
        });

        if (sendError) {
            console.error('❌ Resend Error:', sendError);
            return;
        }

        console.log('✅ Abandoned Cart Email Sent!', data);

        // 3. Update Supabase
        const { error: updateError } = await supabase
            .from('contacts')
            .update({
                automation_state: {
                    ...lead.automation_state,
                    abandoned_sent: true,
                    abandoned_sent_at: new Date().toISOString(),
                    manual_trigger: true
                }
            })
            .eq('email', email);

        if (updateError) {
            console.error('❌ Error updating Supabase:', updateError.message);
        } else {
            console.log('✅ Lead record updated in Supabase.');
        }

    } catch (e) {
        console.error('❌ Fatal Error:', e.message);
    }
}

sendManualAbandonedCart();
