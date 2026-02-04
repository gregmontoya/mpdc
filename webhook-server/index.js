const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to get raw body for Stripe signature verification
// AND Enable CORS for frontend lead capture
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// --------------------------------------------------------------------------
// 🧲 LEAD CAPTURE ENDPOINT
// --------------------------------------------------------------------------
app.post('/capture-lead', async (req, res) => {
    const { email, name } = req.body;

    console.log('------------------------------------------');
    console.log('🧲 LEAD CAPTURED (Pre-Checkout):');
    console.log(`📧 Email: ${email}`);

    // 0. Save to Supabase (CRM)
    const { error } = await supabase
        .from('leads')
        .insert([{ email, name, source: 'checkout_button' }]);

    if (error) console.error('Supabase Lead Error:', error);
    else console.log('✅ Lead saved to Supabase (CRM)');

    // Add to Resend Audience (Using SDK)
    try {
        let audienceId = process.env.RESEND_AUDIENCE_ID;

        const { data, error } = await resend.contacts.create({
            email: email,
            first_name: name,
            unsubscribed: false,
            audience_id: audienceId
        });

        if (error) console.error('Resend Contact Error:', error);
        else console.log('✅ Added to Resend Audience');

    } catch (err) {
        console.error('❌ Resend API Error:', err);
    }

    console.log('------------------------------------------');
    res.json({ received: true });
});


// --------------------------------------------------------------------------
// 📧 EMAIL SENDING LOGIC (Using Resend SDK)
// --------------------------------------------------------------------------
async function sendWelcomeEmail(email, name, password) {
    const loginUrl = 'https://menspostdivorcecoaching.com/system/login.html';

    // ✨ PREMIUM EMAIL TEMPLATE ✨
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MPDC</title>
      <style>
        /* RESET & BASICS */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333; line-height: 1.6; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
        
        /* CONTAINER */
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        
        /* HEADER */
        .header { background: linear-gradient(135deg, #0B3B36 0%, #1A5C54 100%); padding: 40px 0; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; }
        .logo-text { color: #C4613A; font-weight: 700; font-size: 28px; display: block; margin-bottom: 10px; }
        
        /* CONTENT */
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: bold; color: #0B3B36; margin-bottom: 20px; }
        .text { color: #555555; font-size: 16px; margin-bottom: 20px; }
        
        /* CREDENTIALS BOX */
        .credentials-box { background-color: #F8F9FA; border-left: 5px solid #C4613A; padding: 25px; margin: 30px 0; border-radius: 4px; }
        .cred-item { margin-bottom: 10px; font-size: 15px; }
        .cred-label { font-weight: bold; color: #0B3B36; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
        .cred-value { font-family: 'Courier New', monospace; font-size: 16px; background: #fff; padding: 4px 8px; border: 1px solid #eee; border-radius: 3px; color: #333; }
        
        /* BUTTON */
        .btn-container { text-align: center; margin: 35px 0; }
        .btn { background: linear-gradient(to right, #C4613A, #A64D29); color: #ffffff !important; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(196, 97, 58, 0.3); transition: all 0.3s ease; }
        
        /* FOOTER */
        .footer { background-color: #0B3B36; color: #8faaaa; padding: 30px; text-align: center; font-size: 13px; }
        .footer a { color: #ffffff; text-decoration: none; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <span class="logo-text">MPDC</span>
            <h1>Men's Divorce Mindset</h1>
          </div>
          
          <!-- BODY -->
          <div class="content">
            <div class="greeting">Welcome, ${name}!</div>
            <p class="text">Congratulations on taking the first step towards rebuilding your future. Your payment was successful, and your account is ready.</p>
            
            <p class="text">Here are your secure login credentials:</p>
            
            <!-- ACCESS CARD -->
            <div class="credentials-box">
              <div class="cred-item">
                <span class="cred-label">Login URL</span>
                <span class="cred-value"><a href="${loginUrl}" style="color:#C4613A;text-decoration:none;">${loginUrl}</a></span>
              </div>
              <div class="cred-item">
                <span class="cred-label">Username / Email</span>
                <span class="cred-value">${email}</span>
              </div>
              <div class="cred-item">
                <span class="cred-label">Temporary Password</span>
                <span class="cred-value" style="font-weight:bold;">${password}</span>
              </div>
            </div>
            
            <div class="btn-container">
              <a href="${loginUrl}" class="btn">Access The System</a>
            </div>
            
            <p style="font-size:14px; color:#999; text-align:center;">
              Please change your password after your first login.<br>
            </p>
          </div>
          
          <!-- FOOTER -->
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Men's Post-Divorce Coaching.</p>
            <p>Questions? Reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Men\'s Divorce Mindset System <hello@menspostdivorcecoaching.com>',
            to: email,
            subject: '🎉 Welcome! Your Login Credentials',
            html: emailHTML
        });

        if (error) {
            console.error('❌ Resend Error:', error);
            throw error;
        }

        console.log(`✅ Welcome email sent to ${email}`, data);
        return true;
    } catch (error) {
        console.error('❌ Fatal Email Error:', error);
        throw error;
    }
}

// --------------------------------------------------------------------------
// 🔐 WEBHOOK VERIFICATION (Manual)
// --------------------------------------------------------------------------
function verifyStripeSignature(payload, signatureHeader) {
    if (!signatureHeader) return false;

    // Parse the signature header
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let signature = '';

    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 't') timestamp = value;
        if (key === 'v1') signature = value;
    });

    if (!timestamp || !signature) return false;

    // Construct the signed payload
    const signedPayload = `${timestamp}.${payload}`;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

// --------------------------------------------------------------------------
// 🔔 MAIN WEBHOOK ENDPOINT
// --------------------------------------------------------------------------
app.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];

        console.log('------------------------------------------');
        console.log('🔔 WEBHOOK RECEIVED');

        if (!verifyStripeSignature(req.rawBody, signature)) {
            console.error('❌ Invalid signature');
            return res.status(400).send('Invalid signature');
        }

        console.log('✅ Signature Verified!');

        let event;
        try {
            event = JSON.parse(req.rawBody);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const email = session.customer_email || session.customer_details?.email;
            const name = session.customer_details?.name || email.split('@')[0];

            if (!email) {
                console.error('No email found in session');
                return res.status(400).send('No email found');
            }

            // Generate password & hash
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
            let password = '';
            for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

            // 1. Create User in CRM
            console.log(`Creating user: ${email}`);
            const { error: dbError } = await supabase.from('profiles').insert([
                { email: email, name: name, access_level: 'student' }
            ]);

            if (dbError) {
                console.error('Supabase Error:', dbError);
                // Continue, don't block email
            } else {
                console.log('✅ User saved to CRM');
            }

            // 2. Send Email
            await sendWelcomeEmail(email, name, password);

            res.json({ received: true, email });
        } else {
            res.json({ received: true });
        }
    } catch (fatalError) {
        console.error('🔥 FATAL SERVER ERROR:', fatalError);
        res.status(500).json({
            error: 'Internal Server Error',
            details: fatalError.message,
            stack: fatalError.stack
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL) {
    // Export for Vercel Serverless
    module.exports = app;
} else {
    // Start server locally
    app.listen(PORT, () => {
        console.log(`🚀 Webhook server running on port ${PORT}`);
    });
}
