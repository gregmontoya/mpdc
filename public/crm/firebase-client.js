// -------------------------------------------------------------------------
// MPDC CRM Database Connector - 100% UNIFIED FIREBASE ENGINE
// -------------------------------------------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyBSxrgaNnTzRMqo-9C47vZfnTTDRqyyb10",
    authDomain: "mpdc-website-32dae.firebaseapp.com",
    projectId: "mpdc-website-32dae",
    storageBucket: "mpdc-website-32dae.firebasestorage.app",
    messagingSenderId: "210457065303",
    appId: "1:210457065303:web:72882e734aa8054d283012"
};

let fb_firestore = null;

const getFirestore = () => {
    if (fb_firestore) return fb_firestore;
    try {
        if (typeof window.firebase !== 'undefined') {
            if (!window.firebase.apps.length) {
                window.firebase.initializeApp(firebaseConfig);
            }
            fb_firestore = window.firebase.firestore();
            return fb_firestore;
        }
    } catch (e) {
        console.error('Firebase Firestore CRM Init Error:', e);
    }
    return null;
};

// Fallback seed leads if Firestore collection is initially fresh
const INITIAL_DEMO_LEADS = [
    {
        id: 'lead-mark-1',
        name: 'Mark Henderson',
        email: 'mark.h@example.com',
        instagram_handle: '@dad_life_struggles',
        status: 'new',
        source: 'Instagram',
        source_detail: 'Reel: Ex-Wife Frame',
        created_at: new Date().toISOString(),
        deal_value: 1500,
        notes: 'Ex-wife initiated no-contact on kids. Highly motivated to regain frame.',
        pain_point: 'Parental Alienation',
        active_sequence: 'Day 1: Identity Awakening'
    },
    {
        id: 'lead-mike-2',
        name: 'Mike Ross',
        email: 'mike.ross@gmail.com',
        instagram_handle: '@fitness_mike_88',
        status: 'convo',
        source: 'Organic SEO',
        source_detail: 'Article: Credit Reset Protocol',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        deal_value: 2000,
        notes: 'Financial drain recovery. Wants asset protection consultation.',
        pain_point: 'Financial Recovery',
        active_sequence: 'Financial Reset 5-Day'
    },
    {
        id: 'lead-steve-3',
        name: 'Steve Callaway',
        email: 'steve.c@corporate.com',
        instagram_handle: '@finance_guy_steve',
        status: 'qualifying',
        source: 'Meta Ads',
        source_detail: 'Campaign: Low Ticket Frame',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        deal_value: 1500,
        notes: 'High conflict divorce in progress. Needs Gray Rock coaching.',
        pain_point: 'Conflict Management',
        active_sequence: null
    },
    {
        id: 'lead-david-4',
        name: 'David Vance',
        email: 'david.vance@live.com',
        instagram_handle: null,
        status: 'course_sent',
        source: 'Stripe Checkout',
        source_detail: 'Core Mindset System $27',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        deal_value: 27,
        notes: 'Purchased $27 Core System. Watching Module 1.',
        pain_point: 'Mindset Rebuild',
        active_sequence: 'Student Onboarding'
    }
];

// 1. Fetch Prospects / Leads
async function fetchLeads() {
    const db = getFirestore();
    if (!db) {
        console.warn('Firestore unavailable, loading demo leads.');
        return INITIAL_DEMO_LEADS;
    }

    try {
        const snap = await db.collection('prospects').get();
        if (snap.empty) {
            console.log('No prospects in Firestore yet, displaying starter pipeline.');
            return INITIAL_DEMO_LEADS;
        }

        return snap.docs.map(doc => {
            const d = doc.data();
            const isInsta = d.email && d.email.endsWith('@instagram.com');
            const igHandle = isInsta ? '@' + d.email.split('@')[0] : d.instagram_handle || null;
            const actualEmail = isInsta ? null : d.email;

            return {
                id: doc.id,
                name: d.name || (d.email ? d.email.split('@')[0] : 'Lead'),
                email: actualEmail,
                instagram_handle: igHandle,
                status: d.status || d.funnel_stage || 'new',
                source: d.attribution?.utm_source || d.source || 'Direct',
                source_detail: d.attribution?.utm_campaign || d.source_detail || '',
                created_at: d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : (d.created_at || new Date().toISOString()),
                deal_value: d.deal_value ?? 1500,
                notes: d.notes || 'No notes yet.',
                pain_point: d.pain_point || 'General Mindset',
                active_sequence: d.active_sequence || null
            };
        });
    } catch (e) {
        console.error('Firestore fetchLeads Error:', e);
        return INITIAL_DEMO_LEADS;
    }
}

// 2. Update Deal / Funnel Status
async function updateLeadStatus(id, status) {
    const db = getFirestore();
    if (!db) return;
    try {
        await db.collection('prospects').doc(id).set({
            status: status,
            funnel_stage: status,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`✅ Lead ${id} moved to ${status} in Firestore`);
    } catch (e) {
        console.error('Firestore Status Update Error:', e);
    }
}

// 3. Update Deal Value & Pain Point
async function updateWorkInfo(id, value, painPoint) {
    const db = getFirestore();
    if (!db) return false;
    try {
        await db.collection('prospects').doc(id).set({
            deal_value: parseFloat(value) || 0,
            pain_point: painPoint,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error('Firestore Value Update Error:', e);
        return false;
    }
}

// 4. Update Lead Notes
async function updateLeadNotes(id, text) {
    const db = getFirestore();
    if (!db) return false;
    try {
        await db.collection('prospects').doc(id).set({
            notes: text,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error('Firestore Note Update Error:', e);
        return false;
    }
}

// 5. Enroll in Sequence
async function enrollInSequence(id, sequenceName) {
    const db = getFirestore();
    if (!db) return false;
    try {
        await db.collection('prospects').doc(id).set({
            active_sequence: sequenceName,
            enrolled_at: new Date().toISOString(),
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error('Firestore Sequence Enroll Error:', e);
        return false;
    }
}

// 6. Create Manual Social Lead
async function createSocialLead(handle, name, painPoint, notes) {
    const db = getFirestore();
    if (!db) return false;
    try {
        await db.collection('prospects').add({
            email: `${handle.replace('@', '')}@instagram.com`,
            name: name || handle,
            instagram_handle: handle.startsWith('@') ? handle : '@' + handle,
            status: 'prospect',
            source: 'Instagram',
            source_detail: 'Manual Quick-Add',
            deal_value: 1500,
            pain_point: painPoint || 'General',
            notes: notes || 'New lead via DM quick-add.',
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error('Firestore Create Lead Error:', e);
        return false;
    }
}

// 7. Fetch Paying Clients (Profiles)
async function fetchClients() {
    const db = getFirestore();
    if (!db) return [];
    try {
        const snap = await db.collection('profiles').get();
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error('Firestore fetchClients Error:', e);
        return [];
    }
}

// EXPORT TO WINDOW FOR GLOBAL CRM ACCESS
window.fetchLeads = fetchLeads;
window.updateLeadStatus = updateLeadStatus;
window.updateWorkInfo = updateWorkInfo;
window.updateLeadNotes = updateLeadNotes;
window.enrollInSequence = enrollInSequence;
window.createSocialLead = createSocialLead;
window.fetchClients = fetchClients;
