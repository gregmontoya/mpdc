const admin = require('firebase-admin');

// Initialize with project ID (relies on gcloud auth or GOOGLE_APPLICATION_CREDENTIALS)
admin.initializeApp({
    projectId: 'mpdc-website-32dae'
});

const db = admin.firestore();

const LEADS_TO_DELETE = [
    'gregmontoya1@gmail.com',
    'test@example.com',
    'test@gmail.com',
    'fkldskfj@gmail.com'
];

const MEMBERS_TO_DELETE = [
    'final_webhook_victory_confirmed@example.com',
    'victory_final_test@example.com',
    'verify_final_webhook_2@example.com',
    'gregmontoya10@gmail.com',
    'victory_confirmed_9am@example.com',
    'final_victory_test_8am@example.com',
    'hello@gregmontoya.net',
    'gregmontoya1@gmail.com' // Also listed as member in some context or just cleanup
];

const NAMES_TO_DELETE = [
    'Test Record' // For the one with null email
];

async function deleteCollectionByEmail(collection, emails) {
    const batch = db.batch();
    let count = 0;

    for (const email of emails) {
        const snapshot = await db.collection(collection).where('email', '==', email).get();
        if (snapshot.empty) continue;

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            count++;
            console.log(`🗑️ Prepared to delete from ${collection}: ${email} (${doc.id})`);
        });
    }

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Deleted ${count} records from ${collection}.`);
    } else {
        console.log(`No records found in ${collection} for provided emails.`);
    }
}

async function deleteByName(collection, names) {
    const batch = db.batch();
    let count = 0;

    for (const name of names) {
        const snapshot = await db.collection(collection).where('name', '==', name).get();
        if (snapshot.empty) continue;

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            count++;
            console.log(`🗑️ Prepared to delete from ${collection}: ${name} (${doc.id})`);
        });
    }

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Deleted ${count} records from ${collection}.`);
    }
}

async function main() {
    console.log('🧹 Starting cleanup of test data...');

    // Delete Leades
    await deleteCollectionByEmail('prospects', LEADS_TO_DELETE);
    await deleteByName('prospects', NAMES_TO_DELETE);

    // Delete Members
    await deleteCollectionByEmail('profiles', MEMBERS_TO_DELETE);

    // Also cleanup leads that might have been created for members during testing
    await deleteCollectionByEmail('prospects', MEMBERS_TO_DELETE);

    console.log('🎉 Cleanup complete.');
    process.exit(0);
}

main().catch(console.error);
