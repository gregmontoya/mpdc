#!/usr/bin/env node

/**
 * Google Indexing API Submission Script
 * Directly pings Google to re-crawl updated URLs for instant visibility.
 * Requirements: 
 * 1. Google Service Account JSON key (google-indexing-service-account.json)
 * 2. Service Account email added as "Owner" in Google Search Console.
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE = path.join(__dirname, '../google-indexing-service-account.json');
const SITEMAP_PATH = path.join(__dirname, '../dist/sitemap-0.xml');

async function submitToGoogle() {
    console.log('\n========================================');
    console.log('  Google Indexing API Submission');
    console.log('========================================\n');

    if (!fs.existsSync(KEY_FILE)) {
        console.error('❌ Error: Service Account Key not found at:', KEY_FILE);
        console.log('   Please place your "google-indexing-service-account.json" in the root directory.');
        process.exit(1);
    }

    if (!fs.existsSync(SITEMAP_PATH)) {
        console.error('❌ Error: Sitemap not found at:', SITEMAP_PATH);
        console.log('   Run "npm run build" first to generate the sitemap.');
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing('v3');
        const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
        const urls = sitemapContent.match(/<loc>(.*?)<\/loc>/g)
            .map(loc => loc.replace('<loc>', '').replace('</loc>', '').trim());

        console.log(`✓ Found ${urls.length} URLs to sync.`);

        for (const url of urls) {
            console.log(`🚀 Pinging Google for: ${url}`);
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
            // Delay slightly to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n✨ Google Indexing Sync Complete!');
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

submitToGoogle();
