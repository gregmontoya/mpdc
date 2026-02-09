const admin = require('firebase-admin');

// This script assumes it can pick up credentials from the environment or default local config
admin.initializeApp({
    projectId: 'mpdc-website-32dae'
});

async function createAdmin() {
    const email = 'admin@mpdc.com';
    const password = 'Password123!';

    try {
        const user = await admin.auth().createUser({
            email,
            password,
            displayName: 'Admin'
        });
        console.log('Successfully created user:', user.uid);

        // Set admin flag in Firestore
        await admin.firestore().collection('profiles').doc(user.uid).set({
            email: email,
            name: 'Admin',
            access_level: 'admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('Successfully set admin profile');
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            const user = await admin.auth().getUserByEmail(email);
            await admin.firestore().collection('profiles').doc(user.uid).set({
                access_level: 'admin'
            }, { merge: true });
            console.log('User already exists, updated access_level to admin');
        } else {
            console.error('Error:', error);
        }
    }
}

createAdmin();
