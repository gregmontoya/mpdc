const path = require('path');
const { Resend } = require('resend');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const WelcomeEmail1 = require('./emails/WelcomeEmail1');
const AbandonedCart1 = require('./emails/AbandonedCart1');

const resend = new Resend(process.env.RESEND_API_KEY);
const TEST_EMAIL = 'gregmontoya1@gmail.com';

async function sendTestEmails() {
    console.log(`🚀 Sending test emails to: ${TEST_EMAIL}...`);

    try {
        // 1. Send Welcome Email
        console.log('--- Sending Welcome Email #1 ---');
        await resend.emails.send({
            from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
            to: [TEST_EMAIL],
            subject: 'TEST: Welcome to the System (Review)',
            html: WelcomeEmail1('Greg')
        });
        console.log('✅ Welcome Email Sent');

        // 2. Send Abandoned Cart Email
        console.log('--- Sending Abandoned Cart Email ---');
        await resend.emails.send({
            from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
            to: [TEST_EMAIL],
            subject: 'TEST: Did life get in the way? (Review)',
            html: AbandonedCart1('Greg')
        });
        console.log('✅ Abandoned Cart Email Sent');

        console.log('\n✨ All tests dispatched. Check your inbox!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

sendTestEmails();
