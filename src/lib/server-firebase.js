
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app;

// Check if app is already initialized (to prevent hot-reload errors)
if (!getApps().length) {

    // In development, try to load service account
    if (import.meta.env.DEV) {
        try {
            // Use standard dynamic import
            // Note: We need to use a relative path that Vite can resolve or alias
            // Since it's outside src, we rely on it being available to Node
            // But Vite dynamic import rules are strict.
            // Let's rely on standard 'application-default' via gcloud first if no key.

            // Attempting to load key if present.
            // This path '../../service-account.json' is relative to this file in src/lib
            const serviceAccount = await import('../../service-account.json', { assert: { type: "json" } });

            app = initializeApp({
                credential: cert(serviceAccount.default || serviceAccount)
            });
            console.log("Firebase Admin initialized with service-account.json");

        } catch (e) {
            console.warn("⚠️ service-account.json not found or failed to load.");
            console.warn("Attempting to use Google Application Default Credentials...");
            // Fallback to default (works if you ran 'gcloud auth application-default login')
            app = initializeApp();
        }
    } else {
        // In PRODUCTION (Firebase Cloud Functions), this automatically uses the right credentials
        app = initializeApp();
    }

} else {
    app = getApps()[0];
}

export const db = getFirestore(app);
