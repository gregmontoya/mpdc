const admin = require('firebase-admin');

async function checkUser() {
    const email = 'amorganatm@gmail.com';

    console.log(`🔍 Checking status for: ${email}`);

    // Initialize without specific credential (will use default)
    admin.initializeApp();

    const db = admin.firestore();
    const auth = admin.auth();

    try {
        const user = await auth.getUserByEmail(email);
        console.log(`✅ Auth User Found: ${user.uid}`);

        const doc = await db.collection('profiles').doc(user.uid).get();
        if (doc.exists) {
            console.log('📄 Firestore Profile Found:');
            console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log('❌ Firestore Profile NOT FOUND');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

checkUser();
