const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
require('dotenv').config({ path: path.join(__dirname, '.env.local') }); // Load local env

// Email Templates
const WelcomeEmail1 = require('./emails/WelcomeEmail1');
const AbandonedCart1 = require('./emails/AbandonedCart1');
const NurtureDay3 = require('./emails/NurtureDay3');
const WinBack1 = require('./emails/WinBack1');
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
    console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
}


// Initialize Firebase Admin (Using Env Vars)
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                })
            });
            console.log('✅ Firebase Admin Initialized');
        } else {
            console.warn('⚠️ Firebase environment variables missing. Admin SDK not initialized.');
        }
    } catch (e) {
        console.error('❌ Firebase Admin Init Error:', e.message);
    }
}

let firestore = null;
let firebaseAuth = null;

if (admin.apps.length > 0) {
    firestore = admin.firestore();
    firebaseAuth = admin.auth();
}


const { processAutomations } = require('./automation-processor');
const app = express();
app.use(require('cors')({
    origin: [/localhost:4321$/, /menspostdivorcecoaching\.com$/],
    credentials: true
}));

// --------------------------------------------------------------------------
// 🔵 FACEBOOK CONVERSION API (CAPI) HELPERS
// --------------------------------------------------------------------------
const hashData = (data) => {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
};

const sendFacebookCAPIEvent = async (eventName, userData = {}, customData = {}, req = null) => {
    const pixelId = process.env.FB_PIXEL_ID || '1524876641955362';
    const accessToken = process.env.FB_ACCESS_TOKEN;

    // Capture Client Context from Request
    let clientIp = '127.0.0.1';
    let userAgent = 'Server-Sent-Event';

    if (req) {
        clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (clientIp.includes(',')) clientIp = clientIp.split(',')[0].trim();
        userAgent = req.headers['user-agent'];
    }

    if (!accessToken) {
        console.log(`⚠️ FB_ACCESS_TOKEN missing. CAPI (${eventName}) would have sent for ${userData.email || 'anonymous'}`);
        return;
    }

    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: 'https://menspostdivorcecoaching.com/join',
            user_data: {
                em: userData.email ? [hashData(userData.email)] : [],
                client_ip_address: clientIp,
                client_user_agent: userAgent,
                fbc: userData.fbc || null,
                fbp: userData.fbp || null
            },
            custom_data: customData
        }]
    };

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://graph.facebook.com/v17.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        console.log(`🔵 FB CAPI (${eventName}) Result:`, result);
    } catch (error) {
        console.error(`❌ FB CAPI (${eventName}) Error:`, error);
    }
};

const syncContact = async (email, data = {}) => {
    if (!supabase || !email) return null;

    try {
        // 1. Get current contact if exists
        const { data: currentContact } = await supabase
            .from('contacts')
            .select('*')
            .eq('email', email)
            .single();

        const updateData = {
            email,
            name: data.name || currentContact?.name,
            marketing_status: data.marketing_status || currentContact?.marketing_status || 'subscribed',
            funnel_stage: data.funnel_stage || currentContact?.funnel_stage || 'lead',
            guest_id: data.guestId || currentContact?.guest_id,
            last_active_at: new Date().toISOString(),
            engagement_score: (currentContact?.engagement_score || 0) + (data.incrementScore || 0)
        };

        if (data.lastOpened) updateData.last_opened_at = new Date().toISOString();
        if (data.lastClicked) updateData.last_clicked_at = new Date().toISOString();

        // Merge tags
        if (data.tag) {
            const currentTags = currentContact?.tags || [];
            if (!currentTags.includes(data.tag)) {
                updateData.tags = [...currentTags, data.tag];
            }
        }

        // Merge Attribution (Last-click wins for new campaigns)
        if (data.attribution) {
            updateData.attribution = {
                ...(currentContact?.attribution || {}),
                ...data.attribution
            };
        }

        // Merge Automation State
        if (data.automation) {
            updateData.automation_state = {
                ...(currentContact?.automation_state || {}),
                ...data.automation
            };
        }

        const { data: saved, error } = await supabase
            .from('contacts')
            .upsert(updateData, { onConflict: 'email' })
            .select()
            .single();

        if (error) throw error;

        console.log(`👤 Contact Synced: ${email} [${updateData.funnel_stage}]`);
        return saved;
    } catch (error) {
        console.error('❌ Sync Contact Error:', error.message);
        return null;
    }
};

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) console.error('❌ RESEND_API_KEY is missing');

// Initialize Supabase
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    : null;
if (!supabase) console.error('❌ SUPABASE_URL or SUPABASE_KEY is missing');


// Middleware to get raw body for Stripe signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// --------------------------------------------------------------------------
// 🕵️‍♂️ ANONYMOUS ACTIVITY TRACKER (IDENTITY BRIDGE)
// --------------------------------------------------------------------------
app.post('/track-activity', async (req, res) => {
    const { guestId, url, path, referrer, attribution, userAgent } = req.body;

    try {
        console.log(`🕵️‍♂️ Activity from ${guestId}: ${path}`);

        // 1. Save to Firestore (Primary Activity Log)
        if (firestore) {
            await firestore.collection('visitor_activity').add({
                guestId,
                url,
                path,
                referrer,
                attribution,
                userAgent,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // 2. Save to Supabase (CRM / Analytics)
        if (supabase) {
            const { error } = await supabase
                .from('visitor_activity')
                .insert([{
                    guest_id: guestId,
                    url,
                    path,
                    referrer,
                    attribution,
                    user_agent: userAgent
                }]);
            if (error) console.error('Supabase Activity Error:', error.message);
        }

        res.status(200).json({ status: 'tracked' });
    } catch (error) {
        console.error('❌ Track Activity Error:', error.message);
        res.status(500).json({ error: 'failed to track' });
    }
});

const getInterestInsight = async (guestId) => {
    if (!supabase || !guestId) return '';

    try {
        const { data: activity } = await supabase
            .from('visitor_activity')
            .select('path')
            .eq('guest_id', guestId)
            .limit(10);

        if (!activity || activity.length === 0) return '';

        const paths = activity.map(a => a.path).join(' ');

        if (paths.includes('boundaries')) return "I noticed you were looking into boundaries. In divorce, your frame is your only protection against a chaotic ex-partner.";
        if (paths.includes('rebuild')) return "Rebuilding your life isn't about time; it's about shifting your identity away from 'The Husband' to 'The Individual'.";
        if (paths.includes('identity')) return "Your old identity died with the marriage. The work we do here is about installing a version of you that is unshakeable.";

        return '';
    } catch (e) {
        return '';
    }
};

// --------------------------------------------------------------------------
// 👤 USER LOGIN TRACKING
// --------------------------------------------------------------------------
app.post('/track-login', async (req, res) => {
    const { email } = req.body;
    if (!email || !supabase) return res.status(400).json({ error: 'Email required' });

    try {
        const now = new Date().toISOString();

        // Update Supabase Profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ last_login_at: now })
            .eq('email', email);

        // Update Contacts Heartbeat
        await syncContact(email, { last_active_at: now });

        res.status(200).json({ status: 'tracked' });
    } catch (error) {
        console.error('❌ Track Login Error:', error.message);
        res.status(500).json({ error: 'fail' });
    }
});
app.post('/webhooks/resend', async (req, res) => {
    const event = req.body;

    // Resend sends the email in data.to or data.recipient
    const email = event.data?.to?.[0] || event.data?.recipient;
    const type = event.type; // email.opened, email.clicked

    if (!email) return res.status(200).send('No email found');

    console.log(`📩 Resend Event: ${type} for ${email}`);

    try {
        let scoreInc = 0;
        let updateAttrs = {};

        if (type === 'email.opened') {
            scoreInc = 1;
            updateAttrs.lastOpened = true;
        } else if (type === 'email.clicked') {
            scoreInc = 5; // Clicks are huge
            updateAttrs.lastClicked = true;
        }

        const contact = await syncContact(email, {
            incrementScore: scoreInc,
            ...updateAttrs
        });

        // 🚨 VELOCITY ALERT: Trigger Slack on high score milestones
        if (contact && contact.engagement_score > 0 && contact.engagement_score % 5 === 0) {
            await sendSlackNotification(
                contact.name || 'Anonymous Lead',
                email,
                0,
                'LEAD VELOCITY',
                {
                    utm_source: `Engagement Score: ${contact.engagement_score}`,
                    utm_medium: '🔥 High Intensity Signal'
                }
            );
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ Resend Webhook Error:', error.message);
        res.status(200).send('Error but acknowledged'); // Keep Resend happy
    }
});
app.post('/capture-lead', async (req, res) => {
    const { email, name, guestId, attribution } = req.body;

    console.log('------------------------------------------');
    console.log('🧲 LEAD CAPTURED (In-House Cloud):');
    console.log(`📧 Email: ${email}`);

    try {
        // 1. Sync to In-House Contacts Database
        const contact = await syncContact(email, {
            name,
            guestId,
            attribution,
            tag: 'prospect',
            funnel_stage: 'prospect'
        });

        // 🔵 Send Facebook CAPI (Lead Event)
        sendFacebookCAPIEvent('Lead', {
            email,
            fbc: attribution?.fbc,
            fbp: attribution?.fbp
        }, {
            content_name: 'Marie Recovery Bundle Popup',
            source: 'popup'
        }, req);

        // 🔔 Internal Lead Notification (Real-time visibility)
        await sendLeadNotification(email, name, attribution);

        // 2. Automated Welcome Flow (Email #1)
        if (contact && (!contact.automation_state || !contact.automation_state.welcome_v1_sent)) {
            console.log(`🚀 Triggering Welcome Flow for: ${email}`);

            // The Mirror Effect: Get insight from browsing history
            const insight = await getInterestInsight(guestId);

            if (resend) {
                const { data, error } = await resend.emails.send({
                    from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                    to: [email],
                    subject: 'Stop replaying the Past (Your Recovery Bundle is here)',
                    html: WelcomeEmail1(name || '', email, insight)
                });

                if (error) {
                    console.error('❌ Resend Welcome Error:', error);
                } else {
                    console.log('✅ Welcome Email #1 Sent');
                    // Mark as sent
                    await syncContact(email, {
                        automation: { welcome_v1_sent: true, welcome_v1_date: new Date().toISOString() }
                    });
                }
            }
        } else {
            console.log('ℹ️ Welcome email already sent or contact sync failed.');
        }

        res.status(200).json({ status: 'captured' });
    } catch (error) {
        console.error('❌ Lead Capture Error:', error.message);
        res.status(500).json({ error: 'failed to capture' });
    }
});

// --------------------------------------------------------------------------
// 💳 CREATE STRIPE CHECKOUT SESSION (FORCED USD)
// --------------------------------------------------------------------------
app.post('/create-checkout-session', async (req, res) => {
    const { email, name, plan = 'core', attribution = {}, guestId } = req.body;

    try {
        console.log(`💳 Creating Session for: ${email} (${plan})`);
        if (Object.keys(attribution).length > 0) {
            console.log('🕵️‍♂️ Attribution Data:', attribution);
        }

        // Define price based on plan (Now forced to $27)
        const amount = 2700;
        const productName = "The Men's Divorce Mindset System";

        // 🔵 Send Facebook CAPI (Lead Event)
        sendFacebookCAPIEvent('Lead', {
            email,
            fbc: attribution.fbc,
            fbp: attribution.fbp
        }, { content_name: productName }, req);

        // ----------------------------------------------------------------------
        // 🧲 SILENT PROSPECT CAPTURE (In-House Marketing Cloud)
        // ----------------------------------------------------------------------
        try {
            await syncContact(email, {
                name,
                guestId,
                attribution,
                tag: 'checkout_started',
                funnel_stage: 'prospect'
            });

            if (firestore) {
                await firestore.collection('prospects').add({
                    email,
                    name,
                    source: 'checkout_start',
                    plan: plan,
                    attribution: attribution,
                    status: 'prospect',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            console.log(`✅ CRM lead sync complete for: ${email}`);
        } catch (leadError) {
            console.error('❌ Background Prospect Sync Error:', leadError.message);
        }

        const sessionOptions = {
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: productName,
                        description: 'One-time access to the MPDC System.',
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            allow_promotion_codes: true,
            success_url: `${req.headers.origin}/join/success?session_id={CHECK_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/join`,
            metadata: {
                customer_name: name,
                plan: plan,
                fbc: attribution.fbc || '',
                fbp: attribution.fbp || '',
                utm_source: attribution.utm_source || 'direct',
                utm_medium: attribution.utm_medium,
                utm_campaign: attribution.utm_campaign,
                referrer: attribution.referrer
            }
        };

        // 🕵️‍♂️ PRO DEV TEST BYPASS (Early Exit)
        // If name is GREG_TEST, allows comprehensive local testing
        if ((name === 'GREG_TEST' || name === 'greg_test')) {
            if (!stripe) {
                console.log('🧪 PRO DEV BYPASS: Stripe Missing -> Redirecting GREG_TEST to Success.');
                return res.json({ url: 'https://menspostdivorcecoaching.com/system/success' });
            }
            // If stripe is present, apply coupon
            sessionOptions = { ...sessionOptions, discounts: [{ coupon: 'wyDKIgXD' }] };
        }

        if (!stripe) {
            throw new Error('Stripe is not configured on this server.');
        }

        if (!stripe) {
            throw new Error('Stripe is not configured on this server.');
        }

        const session = await stripe.checkout.sessions.create(sessionOptions);

        res.json({ url: session.url });
    } catch (error) {
        console.error('❌ Stripe Session Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------------------------------------
// � CUSTOM PASSWORD RESET (Fully Branded via Resend)
// --------------------------------------------------------------------------
app.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        console.log(`🔑 Generating reset link for: ${email}`);

        // 1. Generate the secure reset link from Firebase
        // This link points to your standard Firebase handler but we send it via our email
        const resetLink = await firebaseAuth.generatePasswordResetLink(email);

        // 2. Send the branded email
        await sendPasswordResetEmail(email, resetLink);

        res.json({ success: true });
    } catch (error) {
        console.error('❌ Reset Link Error:', error.message);
        // We return success even if user not found to prevent email enumeration (Pro practice)
        res.json({ success: true, note: 'If account exists, email sent.' });
    }
});

async function sendPasswordResetEmail(email, link) {
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .btn { background-color: #C4613A; color: #ffffff !important; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block; }
        </style>
    </head>
    <body style="font-family: sans-serif; color: #333; line-height: 1.6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background: #0b3b36; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 18px; letter-spacing: 2px;">MPDC SYSTEM</h1>
            </div>
            <div style="padding: 40px;">
                <h2 style="margin-top: 0;">Password Reset Request</h2>
                <p>We received a request to reset your password for the Men's Divorce Mindset System.</p>
                <p>Click the button below to set a new password. This link is secure and will expire soon.</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${link}" class="btn">Reset My Password</a>
                </div>
                
                <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    &copy; ${new Date().getFullYear()} Athens NLP Studies, LLC.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    await resend.emails.send({
        from: 'Alex Morgan <hello@menspostdivorcecoaching.com>',
        to: email,
        subject: '🔒 Password Reset: Men\'s Divorce Mindset System',
        html: emailHTML
    });
}

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
// 🚨 ADMIN NOTIFICATION
// --------------------------------------------------------------------------
async function sendAdminNotification(email, name, amount, accessLevel) {
    const emailHTML = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #22c55e;">💰 New Sale detected!</h1>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${name} (${email})</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${accessLevel.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>This user has been automatically provisioned in Firebase and Firestore.</p>
    </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'MPDC System <hello@menspostdivorcecoaching.com>',
            to: ['hello@menspostdivorcecoaching.com', 'gregmontoya1@gmail.com'],
            subject: `💰 New Sale: $${(amount / 100).toFixed(2)} from ${name}`,
            html: emailHTML
        });

        if (error) {
            console.error('❌ Admin Notification Error:', error);
        } else {
            console.log(`✅ Admin notification sent to team`);
        }
    } catch (error) {
        console.error('❌ Fatal Admin Email Error:', error);
    }
}

async function sendLeadNotification(email, name, attribution = {}) {
    const emailHTML = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; border-left: 4px solid #C4613A;">
        <h1 style="color: #C4613A; margin-top: 0;">🧲 New Lead Captured!</h1>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Name:</strong> ${name || 'Anonymous'}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
            <p style="margin: 5px 0; color: #64748b;"><strong>Source:</strong> ${attribution.utm_source || 'Direct / Organic'}</p>
            <p style="margin: 5px 0; color: #64748b;"><strong>Medium:</strong> ${attribution.utm_medium || 'N/A'}</p>
            <p style="margin: 5px 0; color: #64748b;"><strong>Campaign:</strong> ${attribution.utm_campaign || 'N/A'}</p>
            <p style="margin: 5px 0; color: #64748b;"><strong>Ad Content:</strong> ${attribution.utm_content || 'N/A'}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://menspostdivorcecoaching.com/crm/leads" style="background-color: #0B3B36; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Lead in CRM</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center;">
            Sent by MPDC Demand Gen Engine — ${new Date().toLocaleString()}
        </p>
    </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'MPDC Alerts <hello@menspostdivorcecoaching.com>',
            to: ['hello@menspostdivorcecoaching.com', 'gregmontoya1@gmail.com', 'amorganatm@gmail.com'],
            subject: `🧲 New MPDC Lead: ${email} (${attribution.utm_source || 'Organic'})`,
            html: emailHTML,
            reply_to: email // Allow Greg/Alex to reply directly to the lead
        });

        if (error) {
            console.error('❌ Lead Notification Error:', error);
        } else {
            console.log(`✅ Lead notification sent to team for: ${email}`);
        }
    } catch (error) {
        console.error('❌ Fatal Lead Email Error:', error);
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

            // ----------------------------------------------------------------------
            // 🧲 MARK PROSPECT AS CONVERTED (Marketing Cloud)
            // ----------------------------------------------------------------------
            try {
                await syncContact(email, {
                    name,
                    tag: 'customer',
                    funnel_stage: 'student',
                    automation: { purchased_at: new Date().toISOString() }
                });

                if (firestore) {
                    const prospectQuery = await firestore.collection('prospects').where('email', '==', email).get();
                    if (!prospectQuery.empty) {
                        const batch = firestore.batch();
                        prospectQuery.docs.forEach(doc => {
                            batch.update(doc.ref, { status: 'converted', convertedAt: admin.firestore.FieldValue.serverTimestamp() });
                        });
                        await batch.commit();
                        console.log(`🎯 Prospect ${email} converted to buyer.`);
                    }
                }
            } catch (pError) {
                console.error('❌ Failed to update prospect status:', pError.message);
            }

            // Determine Access Level based on Metadata Plan OR Amount
            // Core: $27 (2700 cents) - UPDATED
            // Bundle: $58 (5800 cents) - LEGACY
            const plan = session.metadata?.plan || 'core';
            const amountTotal = session.amount_total; // in cents
            let accessLevel = 'student'; // Default

            // 🔵 Send Facebook CAPI (Purchase Event)
            sendFacebookCAPIEvent('Purchase', {
                email,
                fbc: session.metadata?.fbc,
                fbp: session.metadata?.fbp
            }, {
                value: (amountTotal / 100).toFixed(2),
                currency: 'USD',
                content_name: 'The Men\'s Divorce Mindset System'
            }, req);

            // If they paid for the bundle (LEGACY) or have explicit plan metadata
            if (plan === 'bundle' || amountTotal >= 5800) {
                accessLevel = 'student_bundle';
                console.log('🌟 BUNDLE PURCHASE DETECTED');
            } else {
                console.log('✅ STANDARD PURCHASE DETECTED');
            }

            // Generate password & hash
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
            let password = '';
            for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

            // 1. Create User in CRM (Supabase - Optional Backup)
            try {
                const { error: dbError } = await supabase.from('profiles').insert([
                    { email: email, name: name, access_level: accessLevel }
                ]);
                if (dbError) console.error('Supabase Error:', dbError);
                else console.log('✅ User saved to Supabase (CRM)');
            } catch (e) {
                console.error('Supabase Catch Error:', e.message);
            }

            // 2. Create User in Firebase (PRIMARY FOR DASHBOARD ACCESS)
            try {
                console.log(`🔥 Provisioning Firebase for: ${email}`);

                // Create Auth User
                const userRecord = await firebaseAuth.createUser({
                    email: email,
                    password: password,
                    displayName: name,
                });

                // Create Firestore Profile
                await firestore.collection('profiles').doc(userRecord.uid).set({
                    email: email,
                    name: name,
                    access_level: accessLevel,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    purchase_amount: amountTotal / 100
                });

                console.log('✅ Firebase Account & Profile Created');
            } catch (fbError) {
                console.error('❌ Firebase Provisioning Error:', fbError.message);
                // If user already exists, just update their access_level
                if (fbError.code === 'auth/email-already-exists') {
                    try {
                        const user = await firebaseAuth.getUserByEmail(email);
                        await firestore.collection('profiles').doc(user.uid).set({
                            access_level: accessLevel,
                            last_purchase_at: admin.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                        console.log('✅ Existing user access_level updated in Firestore');
                    } catch (e) {
                        console.error('❌ Failed to update existing user:', e.message);
                    }
                }
            }

            // 3. Send Welcome Email
            try {
                await sendWelcomeEmail(email, name, password);
            } catch (err) {
                console.error('⚠️ Welcome Email Failed (Non-fatal):', err.message);
            }

            // 4. Send Admin Notification
            try {
                await sendAdminNotification(email, name, amountTotal, accessLevel);
            } catch (err) {
                console.error('⚠️ Admin Email Failed (Non-fatal):', err.message);
            }

            // 5. Send Slack Notification
            try {
                await sendSlackNotification(name, email, amountTotal, accessLevel, session.metadata);
            } catch (err) {
                console.error('⚠️ Slack Notification Failed (Non-fatal):', err.message);
            }

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

// --------------------------------------------------------------------------
// 💬 SLACK NOTIFICATION
// --------------------------------------------------------------------------
async function sendSlackNotification(name, email, amount, plan, meta = {}) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
        console.log('⚠️ No SLACK_WEBHOOK_URL provided, skipping notification.');
        return;
    }

    const source = meta.utm_source || 'Direct / Unknown';
    const medium = meta.utm_medium ? `(${meta.utm_medium})` : '';

    const message = {
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "💰 New Sale Received!",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Customer:*\n${name}\n(${email})`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Amount:*\n$${(amount / 100).toFixed(2)}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Plan:*\n${plan.toUpperCase()}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Source:*\n${source} ${medium}`
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*Attribution Details:*\nRef: ${meta.referrer || 'N/A'}\nCamp: ${meta.utm_campaign || 'N/A'}`
                }
            },
            {
                type: "divider"
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `📅 *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
        }

        console.log('✅ Slack notification sent');
    } catch (error) {
        console.error('❌ Slack Notification Error:', error.message);
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------------------------------------------------------------------
// 🤖 PROACTIVE AUTOMATION WORKER (Demand Gen Engine)
// --------------------------------------------------------------------------
const runBackgroundAutomation = async () => {
    if (!supabase || !resend) return;

    console.log('🤖 Background Worker: Patrolling sequences...');

    try {
        const now = Date.now();
        const fifteenMins = 15 * 60 * 1000;
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        const fourteenDays = 14 * 24 * 60 * 60 * 1000;

        // ----------------------------------------------------------------------
        // 1. ABANDONED CART (15-45 mins)
        // ----------------------------------------------------------------------
        const { data: abandoned } = await supabase
            .from('contacts')
            .select('*')
            .eq('funnel_stage', 'prospect')
            .lt('last_active_at', new Date(now - fifteenMins).toISOString())
            .gt('last_active_at', new Date(now - 45 * 60 * 1000).toISOString());

        for (const prospect of (abandoned || [])) {
            if (prospect.automation_state?.abandoned_sent) continue;
            console.log(`📧 Sending Abandoned Cart: ${prospect.email}`);
            await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [prospect.email],
                subject: 'Don\'t let the loop win (Complete your comeback)',
                html: AbandonedCart1(prospect.name || '', prospect.email)
            });
            await syncContact(prospect.email, { automation: { abandoned_sent: true, abandoned_sent_at: new Date().toISOString() } });
        }

        // ----------------------------------------------------------------------
        // 2. DAY 3 NURTURE (72 hours)
        // ----------------------------------------------------------------------
        const { data: nurtureLeads } = await supabase
            .from('contacts')
            .select('*')
            .eq('funnel_stage', 'prospect')
            .lt('created_at', new Date(now - threeDays).toISOString())
            .gt('created_at', new Date(now - fourDays).toISOString()); // Limit to 24h window

        for (const lead of (nurtureLeads || [])) {
            if (lead.automation_state?.nurture_d3_sent) continue;
            console.log(`📧 Sending Day 3 Nurture: ${lead.email}`);
            await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [lead.email],
                subject: 'Reclaiming your Frame (MPDC Method)',
                html: NurtureDay3(lead.name || '', lead.email)
            });
            await syncContact(lead.email, { automation: { nurture_d3_sent: true, nurture_d3_date: new Date().toISOString() } });
        }

        // ----------------------------------------------------------------------
        // 3. STUDENT WIN-BACK (14 days inactive)
        // ----------------------------------------------------------------------
        const { data: inactiveStudents } = await supabase
            .from('profiles')
            .select('*')
            .lt('last_login_at', new Date(now - fourteenDays).toISOString());

        for (const student of (inactiveStudents || [])) {
            // Use contact for automation state tracking
            const { data: contact } = await supabase.from('contacts').select('*').eq('email', student.email).single();
            if (contact?.automation_state?.winback_14d_sent) continue;

            console.log(`📧 Sending Win-Back: ${student.email}`);
            await resend.emails.send({
                from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                to: [student.email],
                subject: 'Don\'t let the old habits win',
                html: WinBack1(student.name || '')
            });
            await syncContact(student.email, { automation: { winback_14d_sent: true, winback_14d_date: new Date().toISOString() } });
        }

    } catch (err) {
        console.error('❌ Automation Worker Error:', err.message);
    }
};

const fourDays = 4 * 24 * 60 * 60 * 1000;

// --------------------------------------------------------------------------
// 🤖 AUTOMATION CRON (PROCESSOR)
// --------------------------------------------------------------------------
app.all('/api/cron/process-automation', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const secret = process.env.CRON_SECRET;

    // Security: Only allow if CRON_SECRET matches or if in development
    if (process.env.NODE_ENV === 'production' && (!secret || authHeader !== `Bearer ${secret}`)) {
        console.warn('⚠️ Unauthorized Automation Trigger Attempt');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const results = await processAutomations();
        res.json({ success: true, results });
    } catch (error) {
        console.error('❌ Automation Process Failed:', error.message);
        res.status(500).json({ error: 'Failed', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL) {
    // Export for Vercel Serverless
    module.exports = app;
} else {
    // Start server locally
    app.listen(PORT, () => {
        console.log(`🚀 Webhook server running on port ${PORT}`);

        // Start background automation every 5 minutes
        setInterval(runBackgroundAutomation, 5 * 60 * 1000);
        // Run immediately on start
        setTimeout(runBackgroundAutomation, 10000);
    });
}
