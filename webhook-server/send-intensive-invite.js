require('dotenv').config({ path: './.env.local' });
const { Resend } = require('resend');
const IntensiveInvite = require('./emails/IntensiveInvite');

const resend = new Resend(process.env.RESEND_API_KEY || 're_TTohkdN3_CVLr4gT9G9HWzTueBFKBiEeJ');

const emails = ['gregmontoya1@gmail.com'];

async function sendTests() {
    console.log('🚀 Sending Intensive Invite Test Email...');

    for (const email of emails) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [email],
                subject: 'Join me Friday: Break the Negative Thinking Loop',
                html: IntensiveInvite('Greg')
            });

            if (error) {
                console.error(`❌ Error sending to ${email}:`, error);
            } else {
                console.log(`✅ Sent to ${email}. ID: ${data.id}`);
            }
        } catch (err) {
            console.error(`❌ Unexpected error for ${email}:`, err.message);
        }
    }
}

sendTests();
