require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');
const WelcomeEmail1 = require('./emails/WelcomeEmail1');

const resend = new Resend(process.env.RESEND_API_KEY);

const emails = ['gregmontoya1@gmail.com', 'amorganatm@gmail.com'];

async function sendTests() {
    console.log('🚀 Triggering Live Welcome Email Tests...');

    for (const email of emails) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [email],
                subject: 'Release the weight (Your Recovery Bundle is inside)',
                html: WelcomeEmail1('Greg', email, 'Testing UTMs and Prefill')
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
