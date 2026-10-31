const Day1Identity = require('./emails/Day1Identity');
const Day2Submission = require('./emails/Day2Submission');
const Day3Biology = require('./emails/Day3Biology');
const Day4Legacy = require('./emails/Day4Legacy');
const Day5Binary = require('./emails/Day5Binary');
const AbandonedCart1 = require('./emails/AbandonedCart1');
const firestore = require('./firestore-service');
const Resend = require('resend').Resend;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * THE AUTOMATION PROCESSOR - 100% UNIFIED FIREBASE ENGINE
 * Runs hourly to check for:
 * 1. Abandoned Carts (20 min delay)
 * 2. 5-Day Logic-First Nurture Sequence
 */
const processAutomations = async () => {
    console.log('🤖 Starting Automation Processing with Firestore...');

    if (!resend) {
        console.warn('⚠️ Resend configuration missing or invalid. Automation running in dry-run mode.');
    }

    const results = {
        abandoned_cart_sent: 0,
        nurture_sent: 0,
        errors: []
    };

    let allProspects = [];
    try {
        allProspects = await firestore.listProspects(300);
        console.log(`🔍 Retrieved ${allProspects.length} prospects from Firestore.`);
    } catch (e) {
        console.error('❌ Failed to fetch prospects from Firestore:', e.message);
        results.errors.push(`Firestore fetch error: ${e.message}`);
        return results;
    }

    const now = new Date();
    const twentyMinsAgo = new Date(now.getTime() - 20 * 60 * 1000);

    // -------------------------------------------------------------------------
    // 💳 1. ABANDONED CART (After 20 mins)
    // -------------------------------------------------------------------------
    try {
        const potentialAbandoned = allProspects.filter(lead => {
            if (!lead.email) return false;
            if (lead.status === 'converted' || lead.access_level === 'student') return false;
            
            const state = lead.automation_state || {};
            if (state.abandoned_sent || state.cart_1_sent) return false;

            const activityTime = lead.last_active_at || lead.timestamp || lead.created_at;
            if (!activityTime) return false;

            const lastActive = new Date(activityTime);
            return lastActive <= twentyMinsAgo;
        });

        console.log(`🔍 Found ${potentialAbandoned.length} potential abandoned carts.`);

        for (const lead of potentialAbandoned) {
            console.log(`📧 Sending Abandoned Cart to: ${lead.email}`);

            if (resend) {
                const { error: sendError } = await resend.emails.send({
                    from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                    to: [lead.email],
                    subject: 'Don\'t let the loop win (Complete your comeback)',
                    html: AbandonedCart1(lead.name || '', lead.email)
                });

                if (sendError) {
                    console.error(`❌ Error sending to ${lead.email}:`, sendError);
                    results.errors.push(`${lead.email}: ${sendError.message}`);
                } else {
                    results.abandoned_cart_sent++;
                    const updatedState = {
                        ...(lead.automation_state || {}),
                        abandoned_sent: true,
                        abandoned_sent_at: now.toISOString()
                    };
                    await firestore.upsertProspect(lead.email, { automation_state: updatedState });
                }
            } else {
                results.errors.push(`No active Resend key to send abandoned cart to ${lead.email}`);
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }
    } catch (e) {
        console.error('❌ Abandoned Cart Process Error:', e.message);
        results.errors.push(`Cart Error: ${e.message}`);
    }

    // -------------------------------------------------------------------------
    // 🛡️ 2. THE 5-DAY NURTURE SEQUENCE (Logic-First)
    // -------------------------------------------------------------------------
    try {
        const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

        // Prospects within last 10 days who haven't converted
        const nurtureLeads = allProspects.filter(lead => {
            if (!lead.email) return false;
            if (lead.status === 'converted' || lead.access_level === 'student') return false;

            const createdTime = lead.created_at || lead.timestamp;
            if (!createdTime) return false;

            const created = new Date(createdTime);
            return created >= tenDaysAgo;
        });

        console.log(`🔍 Processing sequence for ${nurtureLeads.length} recent prospects.`);

        let emailsSentThisRun = 0;
        const MAX_EMAILS_PER_RUN = 15;

        for (const lead of nurtureLeads) {
            if (emailsSentThisRun >= MAX_EMAILS_PER_RUN) {
                console.log('⏳ Batch limit reached for this run. Continuing next cycle.');
                break;
            }

            const createdTime = lead.created_at || lead.timestamp;
            const joinedAt = new Date(createdTime);
            const hoursSinceJoined = (now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60);
            const state = lead.automation_state || {};

            let template = null;
            let stepKey = '';
            let subject = '';

            // Day 1: Identity Awakening (24h)
            if (hoursSinceJoined >= 24 && !state.seq_d1_sent) {
                template = Day1Identity;
                stepKey = 'seq_d1_sent';
                subject = 'The version of you she devalued... should die.';
            }
            // Day 2: Submission Trap (48h)
            else if (hoursSinceJoined >= 48 && !state.seq_d2_sent) {
                template = Day2Submission;
                stepKey = 'seq_d2_sent';
                subject = 'Stop explaining. You’re losing.';
            }
            // Day 3: Biological Ghost (72h)
            else if (hoursSinceJoined >= 72 && !state.seq_d3_sent) {
                template = Day3Biology;
                stepKey = 'seq_d3_sent';
                subject = 'Why you can’t "think" your way out of this.';
            }
            // Day 4: Legacy Warning (96h)
            else if (hoursSinceJoined >= 96 && !state.seq_d4_sent) {
                template = Day4Legacy;
                stepKey = 'seq_d4_sent';
                subject = 'Your sons are watching.';
            }
            // Day 5: Binary Choice (120h)
            else if (hoursSinceJoined >= 120 && !state.seq_d5_sent) {
                template = Day5Binary;
                stepKey = 'seq_d5_sent';
                subject = 'One last check.';
            }

            if (template && stepKey) {
                console.log(`📧 Sending ${stepKey} to: ${lead.email}`);

                if (resend) {
                    const { error: sendError } = await resend.emails.send({
                        from: 'Alex Morgan <alex@menspostdivorcecoaching.com>',
                        to: [lead.email],
                        subject: subject,
                        html: template(lead.name || '')
                    });

                    if (sendError) {
                        console.error(`❌ Error sending ${stepKey} to ${lead.email}:`, sendError);
                    } else {
                        emailsSentThisRun++;
                        results.nurture_sent++;
                        const updatedState = {
                            ...state,
                            [stepKey]: true,
                            [`${stepKey}_at`]: now.toISOString()
                        };
                        await firestore.upsertProspect(lead.email, { automation_state: updatedState });
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 600));
            }
        }
    } catch (e) {
        console.error('❌ Nurture Sequence Error:', e.message);
        results.errors.push(`Sequence Error: ${e.message}`);
    }

    console.log('✅ Firestore Automation Processing Complete.');
    return results;
};

module.exports = { processAutomations };
