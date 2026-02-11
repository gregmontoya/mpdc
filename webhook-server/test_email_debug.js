require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
    console.error('❌ RESEND_API_KEY is missing from .env.local');
    process.exit(1);
}

const resend = new Resend(apiKey);

async function testEmail() {
    console.log('📧 Attempting to send test email...');
    console.log(`Using API Key starting with: ${apiKey.substring(0, 5)}...`);

    try {
        const { data, error } = await resend.emails.send({
            from: 'MPDC System <hello@menspostdivorcecoaching.com>',
            to: ['gregmontoya1@gmail.com'], // Sending to you only for test
            subject: '🔍 MPDC Email Debug Test',
            html: '<p>If you received this, the <strong>Email System is WORKING</strong> and the issue is likely a deployment/Environment Variable mismatch on Vercel.</p>'
        });

        if (error) {
            console.error('❌ Resend API Returned Error:');
            console.error(JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Email Sent Successfully!');
            console.log('ID:', data.id);
            console.log('➡️  Check your inbox (and SPAM folder) for "MPDC Email Debug Test"');
        }
    } catch (err) {
        console.error('❌ Unexpected Script Error:', err);
    }
}

testEmail();
