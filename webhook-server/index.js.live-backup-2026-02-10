const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
require('dotenv').config({ path: path.join(__dirname, '.env.local') }); // Load local env
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
    console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
}


// Initialize Firebase Admin (Using Env Vars)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
        console.log('✅ Firebase Admin Initialized');
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


const app = express();
app.use(require('cors')());

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) console.error('❌ RESEND_API_KEY is missing');

// Initialize Supabase
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    : null;
if (!supabase) console.error('❌ SUPABASE_URL or SUPABASE_KEY is missing');


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
// 💳 CREATE STRIPE CHECKOUT SESSION (FORCED USD)
// --------------------------------------------------------------------------
app.post('/create-checkout-session', async (req, res) => {
    const { email, name, plan = 'core' } = req.body;

    try {
        console.log(`💳 Creating Session for: ${email} (${plan})`);

        // Define price based on plan (Now forced to $27)
        const amount = 2700;
        const productName = "The Men's Divorce Mindset System";

        // ----------------------------------------------------------------------
        // 🧲 SILENT PROSPECT CAPTURE (Pre-Checkout)
        // ----------------------------------------------------------------------
        try {
            if (firestore) {
                await firestore.collection('prospects').add({
                    email,
                    name,
                    source: 'checkout_start',
                    plan: plan,
                    status: 'prospect',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            if (resend) {
                await resend.contacts.create({
                    email: email,
                    first_name: name,
                    unsubscribed: false,
                    audience_id: process.env.RESEND_AUDIENCE_ID
                });
            }
            console.log(`✅ Silent prospect capture complete for: ${email}`);
        } catch (leadError) {
            console.error('❌ Background Prospect Capture Error:', leadError.message);
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
            success_url: 'https://menspostdivorcecoaching.com/system/success',
            cancel_url: 'https://menspostdivorcecoaching.com/join',
            metadata: {
                customer_name: name,
                plan: plan
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
            // 🧲 MARK PROSPECT AS CONVERTED
            // ----------------------------------------------------------------------
            try {
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
            await sendWelcomeEmail(email, name, password);

            // 4. Send Admin Notification
            await sendAdminNotification(email, name, amountTotal, accessLevel);

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
