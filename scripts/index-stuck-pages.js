#!/usr/bin/env node

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE = path.join(__dirname, '../google-indexing-service-account.json');

const urlsToIndex = [
    "https://menspostdivorcecoaching.com/learn/5-strategies-rebuild-life-divorce",
    "https://menspostdivorcecoaching.com/learn/biological-stress-of-divorce",
    "https://menspostdivorcecoaching.com/learn/boundaries-ex-wife",
    "https://menspostdivorcecoaching.com/learn/ceo-mindset-post-divorce",
    "https://menspostdivorcecoaching.com/learn/co-parenting-guide-men",
    "https://menspostdivorcecoaching.com/learn/dating-after-divorce-protocol",
    "https://menspostdivorcecoaching.com/learn/divorce-tattoos-identity-anchors",
    "https://menspostdivorcecoaching.com/learn/dvpo-legal-snare",
    "https://menspostdivorcecoaching.com/learn/emergency-divorce-panic-protocol",
    "https://menspostdivorcecoaching.com/learn/how-divorce-changes-a-man",
    "https://menspostdivorcecoaching.com/learn/legacy-standard-purpose",
    "https://menspostdivorcecoaching.com/learn/managing-anger-men",
    "https://menspostdivorcecoaching.com/learn/mens-shame-in-divorce-recovery",
    "https://menspostdivorcecoaching.com/learn/monkey-branching-divorce",
    "https://menspostdivorcecoaching.com/learn/new-social-circle-men",
    "https://menspostdivorcecoaching.com/learn/rebuilding-your-reality-chain",
    "https://menspostdivorcecoaching.com/learn/red-flag-decoder",
    "https://menspostdivorcecoaching.com/learn/starting-over-after-40-divorce-stats",
    "https://menspostdivorcecoaching.com/learn/stop-overthinking-men",
    "https://menspostdivorcecoaching.com/learn/stop-reactionary-communication-ex-wife",
    "https://menspostdivorcecoaching.com/learn/victim-mentality-men",
    "https://menspostdivorcecoaching.com/learn/when-start-dating"
];

async function forceIndex() {
    console.log('\n========================================');
    console.log('  🚀 EXTREME INDEXING: Stuck Pages');
    console.log('========================================\n');

    if (!fs.existsSync(KEY_FILE)) {
        console.error('❌ Error: Service Account Key not found at:', KEY_FILE);
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing('v3');

        console.log(`✓ Pinging Google for ${urlsToIndex.length} stuck pages...`);

        for (const url of urlsToIndex) {
            console.log(`📡 Pushing: ${url}`);
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
            // Delay slightly
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log('\n✨ Force Indexing Complete. Google should crawl these within hours/days.');
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

forceIndex();
