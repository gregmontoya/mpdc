const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
});

const resend = new Resend(env.RESEND_API_KEY);
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

const email = 'eben.pretorius@gmail.com';
const name = 'Eben';

async function recoverEben() {
    console.log(`🚀 Manually recovering notification for ${email}...`);

    // 1. Send Internal Notification
    const { error: notifError } = await resend.emails.send({
        from: 'MPDC Alerts <hello@menspostdivorcecoaching.com>',
        to: ['hello@menspostdivorcecoaching.com', 'gregmontoya1@gmail.com', 'amorganatm@gmail.com'],
        subject: `🧲 RECOVERED Lead: ${email} (Manychat)`,
        html: `
            <h3>🧲 Missed Lead Recovered</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Source:</strong> Manychat</p>
            <p>Notification was delayed due to a server deployment mismatch. The fix is now live.</p>
        `
    });

    if (notifError) {
        console.error('❌ Notification Error:', notifError);
    } else {
        console.log('✅ Internal notification sent.');
    }

    // 2. Send Welcome Email
    const { error: welcomeError } = await resend.emails.send({
        from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
        to: [email],
        subject: 'Stop replaying the Past (Your Recovery Bundle is here)',
        html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                <p>Hey ${name},</p>
                <p>I found you on Instagram—excited to help you rebuild your edge.</p>
                <p>As promised, here is your <strong>Recovery Bundle</strong>. It includes the tactical worksheet we discussed.</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="https://menspostdivorcecoaching.com/learn" style="background: #0B3B36; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Bundle →</a>
                </div>
                <p>If you're ready to stop replaying the past and start leading again, check out the <strong>$27 Mastery System</strong>. It's the full blueprint.</p>
                <p>Stay Sharp,<br>— Alex Morgan</p>
            </div>
        `
    });

    if (welcomeError) {
        console.error('❌ Welcome Email Error:', welcomeError);
    } else {
        console.log('✅ Welcome email sent to lead.');
        // Update CRM
        await supabase.from('contacts').update({
            automation_state: { welcome_v1_sent: true, welcome_v1_at: new Date().toISOString() }
        }).eq('email', email);
    }
}

recoverEben();
