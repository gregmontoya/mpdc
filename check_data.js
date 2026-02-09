
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // I need to check if this exists or if I can use default credentials

// If I don't have a service account key, I might not be able to run this easily from terminal.
// Let me check if there's an easier way.
