const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const IntensiveInvite = require('./emails/IntensiveInvite');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBlast() {
    console.log('🚀 INITIALIZING FULL INTENSIVE EMAIL BLAST...');

    // 1. Fetch all subscribed contacts
    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('email, name')
        .eq('marketing_status', 'subscribed');

    if (error) {
        console.error('❌ Error fetching contacts:', error.message);
        return;
    }

    console.log(`📊 Found ${contacts.length} subscribed contacts. Starting send...`);

    let successCount = 0;
    let failCount = 0;

    for (const contact of contacts) {
        try {
            const { data, resendError } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [contact.email],
                subject: 'Join me Friday: Break the Negative Thinking Loop',
                html: IntensiveInvite(contact.name || 'friend')
            });

            if (resendError) {
                console.error(`❌ Error sending to ${contact.email}:`, resendError);
                failCount++;
            } else {
                console.log(`✅ Sent to ${contact.email}. ID: ${data?.id || 'N/A'}`);
                successCount++;
            }
        } catch (err) {
            console.error(`❌ Unexpected error for ${contact.email}:`, err.message);
            failCount++;
        }
    }

    console.log('------------------------------------------');
    console.log(`🏁 BLAST COMPLETE: ${successCount} Success / ${failCount} Failed.`);
    console.log('------------------------------------------');
}

// Security Check: Don't run automatically unless a specific flag is passed
if (process.argv.includes('--execute')) {
    sendBlast();
} else {
    console.log('⚠️ SAFETY LOCK: Run with "node webhook-server/send-intensive-blast.js --execute" to send to the full list.');
}
