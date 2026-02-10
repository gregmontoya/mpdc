import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// You will need a Service Account Key JSON file for this to work locally.
// If you don't have one, download it from Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// Save it as 'service-account.json' in the root of your project.

const serviceAccountPath = path.resolve("./service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
    console.error("Error: 'service-account.json' not found. Please download your Firebase Admin SDK service account key and place it in the project root.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function seedPost() {
    const slug = "welcome-to-antigravity";
    const postData = {
        title: "Welcome to Antigravity",
        slug: slug,
        summary: "This is a dynamic post fetched from Firestore to demonstrate SEO capabilities.",
        description: "This is the meta description for the post, which will appear in search results.",
        content: `
      <h2>Dynamic Content is Here</h2>
      <p>This content is being pulled directly from your Firestore database.</p>
      <p>Because we are using Astro's SSR (Server Side Rendering) mode with the Node adapter, search engines will see this content fully rendered in the HTML source code, just like a static page.</p>
      <ul>
        <li>Fast Performance</li>
        <li>Great SEO</li>
        <li>Live Data</li>
      </ul>
      <p>Edit this document in your Firestore 'posts' collection to see updates instantly.</p>
    `,
        image: "/images/social-share.jpg",
        publishedDate: new Date().toISOString(),
        author: "Antigravity Agent"
    };

    try {
        await db.collection("posts").doc(slug).set(postData);
        console.log(`Successfully created post: ${slug}`);
        console.log("You can now visit http://localhost:4321/posts/welcome-to-antigravity to see it!");
    } catch (error) {
        console.error("Error creating post:", error);
    }
}

seedPost();
