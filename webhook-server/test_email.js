require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
    console.error('❌ RESEND_API_KEY missing from environment');
    process.exit(1);
}

const resend = new Resend(apiKey);

(async function () {
    try {
        const data = await resend.emails.send({
            from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
            to: 'gregmontoya1@gmail.com',
            subject: 'Test Email from MPDC System',
            html: '<strong>It works!</strong> Your API key is valid.'
        });

        console.log('✅ Success:', data);
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
