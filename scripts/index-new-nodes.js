#!/usr/bin/env node

/**
 * DYNAMIC SEMANTIC NODE INDEXER
 * Scans the blog content directory and automatically pings Google Indexing API
 * for every article in the system. No manual hardcoding required.
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE = path.join(__dirname, '../google-indexing-service-account.json');
const BLOG_CONTENT_DIR = path.join(__dirname, '../src/content/blog');
const BASE_URL = 'https://menspostdivorcecoaching.com/learn/';

async function scanAndIndex() {
    console.log('\n========================================');
    console.log('  🚀 AUTOMATED SEMANTIC HUB INDEXER');
    console.log('========================================\n');

    if (!fs.existsSync(KEY_FILE)) {
        console.error('❌ Error: Service Account Key not found. Skipping indexing.');
        return;
    }

    if (!fs.existsSync(BLOG_CONTENT_DIR)) {
        console.error('❌ Error: Blog content directory not found.');
        return;
    }

    try {
        // 1. Scan blog directory for .md and .mdx files
        const files = fs.readdirSync(BLOG_CONTENT_DIR);
        const slugs = files
            .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
            .map(f => f.replace(/\.mdx?$/, ''));

        console.log(`📂 Found ${slugs.length} blog articles in content folder.`);

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing('v3');

        for (const slug of slugs) {
            const url = `${BASE_URL}${slug}`;
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
                // Ignore 429 rate limits or common errors, just log them
                if (err.code === 429) {
                    console.error('   ⚠️ Rate limit reached. Stopping for now.');
                    break;
                }
                console.error(`   ❌ Failed: ${err.message}`);
            }

            // Respect Google's rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n✨ Semantic index sync complete.');
    } catch (error) {
        console.error('❌ Critical Indexer Error:', error.message);
    }
}

scanAndIndex();
