const { Resend } = require('resend');

// YOUR KEY
const resend = new Resend('re_TTohkdN3_CVLr4gT9G9HWzTueBFKBiEeJ');

(async function () {
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'gregmontoya1@gmail.com',
            subject: 'Test Email from MPDC System',
            html: '<strong>It works!</strong> Your API key is valid.'
        });

        console.log('✅ Success:', data);
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
