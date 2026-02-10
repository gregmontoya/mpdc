const { onRequest } = require("firebase-functions/v2/https");
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

// --------------------------------------------------------------------------
// 💳 STRIPE WEBHOOK (Onboarding & Email Logic)
// --------------------------------------------------------------------------
exports.stripeWebhook = onRequest({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY"] }, async (req, res) => {
    const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
    const stripe = require("stripe")(stripeKey);
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const sig = req.headers["stripe-signature"];
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

    // Debug Signature (Safe logging)
    logger.log(`🔍 Signature check: Secret length: ${webhookSecret.length}, Header present: ${!!sig}`);

    let event;

    try {
        // Use req.rawBody which is a Buffer in Firebase Functions v2
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        logger.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    logger.log(`📥 Webhook Received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const email = session.customer_details.email;
        const name = session.customer_details.name || "Member";
        const amountTotal = session.amount_total;
        const metadata = session.metadata || {};

        // ----------------------------------------------------------------------
        // 🧲 MARK PROSPECT AS CONVERTED (Pro Practice)
        // ----------------------------------------------------------------------
        try {
            const prospectQuery = await admin.firestore().collection("prospects").where("email", "==", email).get();
            if (!prospectQuery.empty) {
                const batch = admin.firestore().batch();
                prospectQuery.docs.forEach(doc => {
                    batch.update(doc.ref, { status: "converted", convertedAt: admin.firestore.FieldValue.serverTimestamp() });
                });
                await batch.commit();
                logger.log(`✅ Prospect ${email} marked as converted.`);
            }
        } catch (err) {
            logger.error("Failed to mark prospect as converted:", err.message);
        }

        // ----------------------------------------------------------------------
        // 🚀 FACEBOOK CAPI (Server-Side Tracking)
        // ----------------------------------------------------------------------
        const fbAccessToken = process.env.FB_ACCESS_TOKEN;
        const fbPixelId = process.env.FB_PIXEL_ID;

        if (fbAccessToken && fbPixelId) {
            try {
                const eventTime = Math.floor(Date.now() / 1000);

                // Hash PII (SHA256)
                const hash = (str) => crypto.createHash('sha256').update(String(str).trim().toLowerCase()).digest('hex');

                const userData = {
                    em: [hash(email)],
                    fn: name ? [hash(name.split(' ')[0])] : undefined,
                    ln: name && name.split(' ').length > 1 ? [hash(name.split(' ').slice(1).join(' '))] : undefined,
                };

                // Add Click ID if present (Critical for matching)
                if (metadata.fbclid) {
                    userData.fbc = `fb.1.${eventTime}.${metadata.fbclid}`;
                }

                // Send Event
                const payload = {
                    data: [{
                        event_name: 'Purchase',
                        event_time: eventTime,
                        action_source: 'website',
                        event_source_url: metadata.landing_page || 'https://menspostdivorcecoaching.com/join',
                        user_data: userData,
                        custom_data: {
                            currency: 'usd',
                            value: amountTotal / 100,
                            content_name: metadata.plan === 'bundle' ? 'System + Bundle' : 'The System',
                            order_id: session.id
                        }
                    }]
                };

                // Async Fetch (Fire and Forget)
                fetch(`https://graph.facebook.com/v19.0/${fbPixelId}/events?access_token=${fbAccessToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(r => r.json())
                    .then(d => logger.log('✅ FB CAPI Success:', d))
                    .catch(e => logger.error('❌ FB CAPI specific error:', e));

            } catch (err) {
                logger.error("FB CAPI Error:", err);
            }
        } else {
            logger.warn("⚠️ FB CAPI Skipped: Missing FB_ACCESS_TOKEN or FB_PIXEL_ID");
        }

        let accessLevel = 'student';
        let packageType = "Standard Access";

        if (metadata.plan === 'bundle' || amountTotal >= 5800) {
            accessLevel = 'student_bundle';
            packageType = "Standard + Hypnosis Bundle";
        }

        try {
            const tempPassword = crypto.randomBytes(8).toString('hex') + "MPDC!";
            let userRecord;

            try {
                userRecord = await admin.auth().createUser({ email, password: tempPassword, displayName: name });
            } catch (e) {
                if (e.code === 'auth/email-already-exists') {
                    userRecord = await admin.auth().getUserByEmail(email);
                } else throw e;
            }

            await admin.firestore().collection("profiles").doc(userRecord.uid).set({
                email,
                name,
                access_level: accessLevel,
                package: packageType,
                purchase_amount: amountTotal / 100,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            await resend.emails.send({
                from: "Alex Morgan <hello@menspostdivorcecoaching.com>",
                to: email,
                subject: "🎉 Welcome! Your Access Credentials",
                html: `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f1f5f9; padding: 40px 20px;">
    <div style="background-color: #0b3b36; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">The Men's Divorce<br><span style="color: #C4613A;">Mindset System</span></h1>
    </div>
    <div style="background-color: #ffffff; padding: 50px 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 700;">Welcome, ${name}!</h2>
        <p style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">You've just taken the most important step. Most men let divorce define them. You have chosen to <strong style="color: #0f172a;">define your future.</strong></p>
        
        <div style="background-color: #f8fafc; border-left: 6px solid #C4613A; padding: 30px; margin: 35px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">ORDER LEVEL</p>
            <p style="margin: 0 0 20px 0; color: #0b3b36; font-size: 16px; font-weight: 700;">${packageType}</p>
            
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">LOGIN EMAIL</p>
            <p style="margin: 0 0 20px 0; color: #0f172a; font-size: 18px; font-weight: 600;">${email}</p>
            
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">TEMPORARY PASSWORD</p>
            <p style="margin: 0; color: #C4613A; font-size: 20px; font-weight: 700; font-family: monospace; letter-spacing: 1px; background: rgba(196, 97, 58, 0.1); display: inline-block; padding: 5px 10px; border-radius: 4px;">${tempPassword}</p>
        </div>

        <div style="text-align: center; margin-top: 45px; margin-bottom: 20px;">
            <a href="https://menspostdivorcecoaching.com/system/login" style="background-color: #C4613A; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(196, 97, 58, 0.4);">Access Your Dashboard &rarr;</a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Questions? Reply directly to this email for support.
        </p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Athens NLP Studies, LLC. All rights reserved.
    </div>
</div>`
            });
            logger.log(`✅ Onboarding complete for: ${email}`);
        } catch (error) {
            logger.error("Onboarding logic error:", error);
        }
    }
    res.status(200).send({ received: true });
});

// --------------------------------------------------------------------------
// 💳 CREATE CHECKOUT SESSION
// --------------------------------------------------------------------------
exports.createCheckoutSession = onRequest({ cors: true, secrets: ["STRIPE_SECRET_KEY"] }, async (req, res) => {
    const { email, name, plan = 'core', attribution = {} } = req.body;
    const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
    const stripe = require("stripe")(stripeKey);
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        // ----------------------------------------------------------------------
        // 🧲 SILENT LEAD CAPTURE (Pre-Checkout)
        // ----------------------------------------------------------------------
        try {
            await admin.firestore().collection("prospects").add({
                email,
                name,
                source: 'checkout_start',
                status: 'prospect',
                plan: plan,
                attribution: attribution,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            if (process.env.RESEND_API_KEY) {
                await resend.contacts.create({
                    email: email,
                    first_name: name,
                    unsubscribed: false,
                    audience_id: process.env.RESEND_AUDIENCE_ID
                });
            }
        } catch (leadErr) {
            logger.error("Silent prospect capture error (non-blocking):", leadErr.message);
        }

        const amount = 2700; // FORCED TO $27
        const productName = "The Men's Divorce Mindset System";

        // Merge attribution into metadata (flattened)
        // Stripe metadata has 500 characters limit per key, and 50 keys limit.
        // We ensure values are strings and not too long.
        const safeMetadata = {
            customer_name: name,
            plan: plan
        };

        // Add interesting attribution fields
        const attrKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'referrer', 'landing_page'];
        attrKeys.forEach(k => {
            if (attribution[k]) safeMetadata[k] = String(attribution[k]).substring(0, 500);
        });

        const sessionOptions = {
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: productName },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://menspostdivorcecoaching.com/system/success',
            cancel_url: 'https://menspostdivorcecoaching.com/join',
            metadata: safeMetadata
        };

        const normalizedName = (name || '').trim().toUpperCase();
        if (normalizedName === 'GREG_TEST') {
            sessionOptions.discounts = [{ coupon: 'wyDKIgXD' }];
        } else {
            sessionOptions.allow_promotion_codes = true;
        }

        const session = await stripe.checkout.sessions.create(sessionOptions);
        res.json({ url: session.url });
    } catch (error) {
        logger.error("Checkout session error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------------------------------------
// 🧲 PROSPECT CAPTURE (Legacy/External)
// --------------------------------------------------------------------------
exports.captureLead = onRequest({ cors: true, secrets: ["RESEND_API_KEY"] }, async (req, res) => {
    const { email, name, source = 'join_page' } = req.body;
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await admin.firestore().collection("prospects").add({
            email,
            name,
            source,
            status: "prospect",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true });
    } catch (error) {
        logger.error("Prospect capture error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------------------------------------
// 💬 CHATBOT
// --------------------------------------------------------------------------
exports.chat = onRequest({ cors: true, secrets: [], maxInstances: 10 }, async (req, res) => {
    const { VertexAI } = require("@google-cloud/vertexai");
    const vertexAI = new VertexAI({ project: "mpdc-website-32dae", location: "us-central1" });
    const generativeModel = vertexAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are the AI assistant for Men's Post-Divorce Coaching (MPDC)..."
    });

    try {
        const { message, history } = req.body;
        const chat = generativeModel.startChat({ history: history || [] });
        const result = await chat.sendMessage(message);
        const responseText = result.response.candidates[0].content.parts[0].text;
        res.json({ response: responseText });
    } catch (error) {
        logger.error("Chat error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --------------------------------------------------------------------------
// 🎞️ VIDEO TRANSCODER
// --------------------------------------------------------------------------
exports.transcodeVideo = onObjectFinalized({ region: "us-west1", memory: "512MiB" }, async (event) => {
    const { TranscoderServiceClient } = require("@google-cloud/video-transcoder").v1;
    const transcoderClient = new TranscoderServiceClient();

    // Only process videos in masters/
    if (!event.data.name.startsWith('masters/')) return;

    logger.log(`🎬 Starting Transcode: ${event.data.name}`);

    // Configuration
    const projectId = process.env.GCLOUD_PROJECT || "mpdc-website-32dae";
    const location = "us-central1"; // Transcoder API region
    const parent = `projects/${projectId}/locations/${location}`;

    const file = event.data;
    const fileName = file.name.split('/').pop();
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    const inputUri = `gs://${file.bucket}/${file.name}`;
    const outputUri = `gs://${file.bucket}/streaming/${baseName}/`;

    const job = {
        inputUri,
        outputUri,
        templateId: "preset/web-hd"
    };

    try {
        const [response] = await transcoderClient.createJob({ parent, job });
        logger.log(`✅ Job Created: ${response.name}`);
    } catch (e) {
        logger.error(`❌ Transcode Failed: ${e.message}`);
    }
});

// --------------------------------------------------------------------------
// 🎫 SUPPORT TICKETS
// --------------------------------------------------------------------------
exports.onSupportTicketCreated = onDocumentCreated({ document: "support_tickets/{ticketId}", secrets: ["RESEND_API_KEY"] }, async (event) => {
    const ticket = event.data.data();
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
        await resend.emails.send({
            from: "MPDC System <hello@menspostdivorcecoaching.com>",
            to: "hello@menspostdivorcecoaching.com",
            subject: `🎫 New Support Ticket: ${ticket.subject}`,
            html: `<p>New ticket from ${ticket.userEmail}</p><p>${ticket.message}</p>`
        });
    } catch (error) {
        logger.error("Support email error:", error);
    }
});

// --------------------------------------------------------------------------
// 🔒 PASSWORD RESET
// --------------------------------------------------------------------------
exports.requestPasswordReset = onRequest({ cors: true, secrets: ["RESEND_API_KEY"] }, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        // Verify user exists first
        await admin.auth().getUserByEmail(email);

        const resetLink = await admin.auth().generatePasswordResetLink(email);

        await resend.emails.send({
            from: 'Alex Morgan <hello@menspostdivorcecoaching.com>',
            to: email,
            subject: '🔒 Reset Your Password - Men\'s Divorce Mindset System',
            html: `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f1f5f9; padding: 40px 20px;">
    <div style="background-color: #0b3b36; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">The Men's Divorce<br><span style="color: #C4613A;">Mindset System</span></h1>
    </div>
    <div style="background-color: #ffffff; padding: 50px 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 700;">Password Reset Request</h2>
        <p style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" style="background-color: #C4613A; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(196, 97, 58, 0.4);">Reset Password</a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            This link will expire in 1 hour for security reasons.
        </p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Athens NLP Studies, LLC. All rights reserved.
    </div>
</div>`
        });

        logger.log(`Password reset email sent to: ${email}`);
        res.json({ success: true });

    } catch (error) {
        logger.error("Password reset error:", error);

        // Don't reveal if user exists or not (security best practice)
        // Always return success to prevent email enumeration
        res.json({ success: true });
    }
});

// --------------------------------------------------------------------------
// 🧠 AEO & SCHEMA ENGINE
// --------------------------------------------------------------------------
exports.onSchemaInjectionUpdated = onDocumentWritten({ document: "schema_injections/{nodeId}", secrets: [] }, async (event) => {
    logger.log(`Schema update: ${event.params.nodeId}`);
});
