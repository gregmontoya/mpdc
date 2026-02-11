const admin = require('firebase-admin');

// Try initializing with just Project ID
admin.initializeApp({
    projectId: 'mpdc-website-32dae'
});

const db = admin.firestore();

async function quickCheck() {
    console.log('--- Quick Check ---');
    try {
        const pSnap = await db.collection('prospects').orderBy('timestamp', 'desc').limit(5).get();
        console.log(`Prospects Found: ${pSnap.size}`);
        pSnap.forEach(doc => console.log(`- ${doc.data().email}`));

        const profSnap = await db.collection('profiles').orderBy('createdAt', 'desc').limit(5).get();
        console.log(`Profiles Found: ${profSnap.size}`);
        profSnap.forEach(doc => console.log(`- ${doc.data().email}`));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

quickCheck();
