#!/usr/bin/env node

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE = path.join(__dirname, '../google-indexing-service-account.json');

const urlsToIndex = [
    "https://menspostdivorcecoaching.com/learn/gray-rock-method/",
    "https://menspostdivorcecoaching.com/learn/vagus-nerve-reset/",
    "https://menspostdivorcecoaching.com/learn/parallel-parenting/",
    "https://menspostdivorcecoaching.com/learn/economics-of-bitterness/",
    "https://menspostdivorcecoaching.com/learn/dvpo-legal-snare/"
];

async function forceIndex() {
    console.log('\n========================================');
    console.log('  🚀 PUSHING NEW SEMANTIC NODES');
    console.log('========================================\n');

    if (!fs.existsSync(KEY_FILE)) {
        console.error('❌ Error: Service Account Key not found.');
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing('v3');

        for (const url of urlsToIndex) {
            console.log(`📡 Pushing to Google: ${url}`);
            try {
                await indexing.urlNotifications.publish({
                    auth,
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED',
                    },
                });
                console.log('   ✅ Success');
            } catch (err) {
                console.error(`   ❌ Failed: ${err.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log('\n✨ Semantic Blitz Complete. These nodes are now live in Google\'s queue.');
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

forceIndex();
