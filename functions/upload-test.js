const admin = require("firebase-admin");
const path = require("path");

// Use the default project ID from .firebaserc if possible, or hardcode it
const projectId = "mpdc-website-32dae";
const bucketName = `${projectId}.firebasestorage.app`;

admin.initializeApp({
    storageBucket: bucketName
});

async function upload() {
    const bucket = admin.storage().bucket();
    const filePath = "/Users/gregmontoya/Documents/Workspaces/MPDC-New-Website/assets/videos/00-Module-done.mp4";
    const destination = "masters/test-video.mp4";

    console.log(`Uploading ${filePath} to gs://${bucketName}/${destination}...`);

    try {
        await bucket.upload(filePath, {
            destination: destination,
        });
        console.log("Upload successful!");
    } catch (error) {
        console.error("Upload failed:", error);
        process.exit(1);
    }
}

upload();
