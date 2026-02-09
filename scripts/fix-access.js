const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// --------------------------------------------------------------------------
// 🛠 CONFIGURATION
// --------------------------------------------------------------------------
// For local use, you might need to export these or use a service account key
// Usage: node scripts/fix-access.js alex@example.com student_bundle
// --------------------------------------------------------------------------

async function fixUserAccess() {
    const email = process.argv[2];
    const newLevel = process.argv[3] || 'student_bundle';

    if (!email) {
        console.error('❌ Please provide an email address.');
        console.log('Usage: node scripts/fix-access.js <email> [access_level]');
        process.exit(1);
    }

    console.log(`🚀 Attempting to fix access for: ${email}`);
    console.log(`📈 New Access Level: ${newLevel}`);

    // Initialize Firebase
    if (!admin.apps.length) {
        // Try to initialize using default credentials (works if logged in with firebase CLI)
        try {
            admin.initializeApp({
                projectId: 'mpdc-website-32dae'
            });
            console.log('✅ Firebase Admin Initialized');
        } catch (e) {
            console.error('❌ Firebase Admin Init Error:', e.message);
            console.log('Ensure you are logged in with Firebase CLI or have GOOGLE_APPLICATION_CREDENTIALS set.');
            process.exit(1);
        }
    }

    const db = admin.firestore();
    const auth = admin.auth();

    try {
        // 1. Find User in Firebase Auth
        const user = await auth.getUserByEmail(email);
        console.log(`👤 Found user with UID: ${user.uid}`);

        // 2. Update Firestore Profile
        await db.collection('profiles').doc(user.uid).set({
            access_level: newLevel,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            fixed_manually: true
        }, { merge: true });

        console.log(`✅ Success! Updated access_level to "${newLevel}" in Firestore.`);

        // 3. Update Supabase (Optional consistency)
        // Note: You might need to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
            const { error } = await supabase
                .from('profiles')
                .update({ access_level: newLevel })
                .eq('email', email);

            if (error) console.error('⚠️ Supabase sync failed:', error.message);
            else console.log('✅ Success! Synced with Supabase.');
        } else {
            console.log('ℹ️ Skipping Supabase sync (Missing environment variables).');
        }

        console.log('\n✨ DONE. Alex should now have access after a fresh login or page refresh.');

    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
        process.exit(1);
    }
}

fixUserAccess();
