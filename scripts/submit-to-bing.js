#!/usr/bin/env node

/**
 * Bing IndexNow Submission Script
 * Automatically submits all site URLs to Bing for instant indexing
 * Runs after each deployment via npm run deploy-safe
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BING_API_KEY = '6b47a441cc39414883d8c7f36533b54a';
const SITE_URL = 'https://menspostdivorcecoaching.com';
const SITEMAP_PATH = path.join(__dirname, '../dist/sitemap-0.xml');

/**
 * Parse sitemap XML and extract all URLs
 */
function parseSitemap() {
    try {
        const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
        const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);

        if (!urlMatches) {
            console.log('⚠️  No URLs found in sitemap');
            return [];
        }

        const urls = urlMatches.map(match =>
            match.replace('<loc>', '').replace('</loc>', '').trim()
        );

        console.log(`✓ Found ${urls.length} URLs in sitemap`);
        return urls;
    } catch (error) {
        console.error('❌ Error reading sitemap:', error.message);
        return [];
    }
}

/**
 * Submit URLs to Bing IndexNow API
 */
function submitToBing(urls) {
    if (urls.length === 0) {
        console.log('⚠️  No URLs to submit');
        return;
    }

    const payload = JSON.stringify({
        host: 'menspostdivorcecoaching.com',
        key: BING_API_KEY,
        keyLocation: `${SITE_URL}/${BING_API_KEY}.txt`,
        urlList: urls
    });

    const options = {
        hostname: 'api.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    console.log('\n🚀 Submitting URLs to Bing IndexNow...');

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ Successfully submitted to Bing!');
                console.log(`   ${urls.length} URLs submitted for indexing`);
            } else if (res.statusCode === 202) {
                console.log('✅ Bing accepted the submission!');
                console.log(`   ${urls.length} URLs queued for indexing`);
            } else {
                console.log(`⚠️  Bing responded with status: ${res.statusCode}`);
                if (data) console.log('   Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error submitting to Bing:', error.message);
    });

    req.write(payload);
    req.end();
}

/**
 * Main execution
 */
function main() {
    console.log('\n========================================');
    console.log('  Bing IndexNow Submission');
    console.log('========================================\n');

    // Check if sitemap exists
    if (!fs.existsSync(SITEMAP_PATH)) {
        console.error('❌ Sitemap not found at:', SITEMAP_PATH);
        console.log('   Make sure the site is built before running this script');
        process.exit(1);
    }

    // Parse sitemap and submit
    const urls = parseSitemap();
    submitToBing(urls);
}

// Run the script
main();
