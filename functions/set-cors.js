const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'mpdc-website-32dae.firebasestorage.app';

async function setCors() {
    await storage.bucket(bucketName).setCorsConfiguration([
        {
            maxAgeSeconds: 3600,
            method: ['GET'],
            origin: ['*'],
            responseHeader: ['Content-Type'],
        },
    ]);

    console.log(`CORS configuration set for bucket ${bucketName}`);
}

setCors().catch(console.error);
