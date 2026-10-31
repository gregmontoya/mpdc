const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Load .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
});

const resend = new Resend(env.RESEND_API_KEY);
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

const email = 'fjalr32@gmail.com';
const name = 'Franklin';

async function fixFranklin() {
    console.log(`🚀 Manually processing ${email}...`);

    // 1. Send the Welcome Email
    const { data, error } = await resend.emails.send({
        from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
        to: [email],
        subject: 'Stop replaying the Past (Your Recovery Bundle is here)',
        html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                <p>Hey Franklin,</p>
                <p>I found you on Instagram—excited to help you rebuild your edge.</p>
                <p>As promised, here is your <strong>Recovery Bundle</strong>. It includes the tactical worksheet we discussed in the DMs.</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="https://menspostdivorcecoaching.com/learn" style="background: #0B3B36; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Bundle →</a>
                </div>
                <p>If you're ready to stop replaying the past and start leading again, check out the <strong>$27 Mastery System</strong>. It's the full blueprint.</p>
                <p>Stay Sharp,<br>— Alex Morgan</p>
            </div>
        `
    });

    if (error) {
        console.error('❌ Resend Error:', error);
        return;
    }

    // 2. Update CRM
    const { error: dbError } = await supabase.from('contacts').update({
        automation_state: { welcome_v1_sent: true, welcome_v1_at: new Date().toISOString() }
    }).eq('email', email);

    if (dbError) {
        console.error('❌ DB Error:', dbError);
    } else {
        console.log('✅ Franklin is now 100% processed and in the flow.');
    }
}

fixFranklin();
