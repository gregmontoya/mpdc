# Bing IndexNow Integration Guide

## Overview
Automated Bing IndexNow submission ensures instant indexing of all site URLs on every deployment. This gives you the same instant indexing advantage on Bing/DuckDuckGo that you have with Google Search Console.

## Benefits
- **Instant Indexing**: New content appears in Bing within minutes instead of days/weeks
- **Zero Manual Work**: Runs automatically on every deployment
- **Multi-Search Engine**: Bing powers DuckDuckGo, Yahoo, and other search engines
- **Free**: No API costs, unlimited submissions

## Implementation Steps

### 1. Get Your Bing API Key
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add and verify your site
3. Navigate to **Settings** → **API Access**
4. Copy your **API Key** (looks like: `6b47a441cc39414883d8c7f36533b54a`)

### 2. Create the API Key Verification File
Create a file in your `public/` directory named `{YOUR_API_KEY}.txt` containing only the API key:

```bash
# Example: public/6b47a441cc39414883d8c7f36533b54a.txt
6b47a441cc39414883d8c7f36533b54a
```

This file proves to Bing that you own the domain.

### 3. Create the Submission Script
Create `scripts/submit-to-bing.js`:

```javascript
#!/usr/bin/env node

/**
 * Bing IndexNow Submission Script
 * Automatically submits all site URLs to Bing for instant indexing
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - UPDATE THESE FOR YOUR PROJECT
const BING_API_KEY = 'YOUR_API_KEY_HERE';
const SITE_URL = 'https://yoursite.com';
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
        host: SITE_URL.replace('https://', '').replace('http://', ''),
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
```

### 4. Make the Script Executable
```bash
chmod +x scripts/submit-to-bing.js
```

### 5. Update package.json
Add the Bing submission to your deployment script:

```json
{
  "scripts": {
    "deploy-safe": "npm run build && node scripts/pre-deploy-check.js && npx firebase-tools deploy --only hosting && node scripts/submit-to-bing.js"
  }
}
```

### 6. Test the Integration
```bash
npm run deploy-safe
```

You should see output like:
```
========================================
  Bing IndexNow Submission
========================================

✓ Found 40 URLs in sitemap
🚀 Submitting URLs to Bing IndexNow...
✅ Bing accepted the submission!
   40 URLs queued for indexing
```

## Verification

### Check Bing Webmaster Tools
1. Go to **Bing Webmaster Tools** → **URL Inspection**
2. Enter any URL from your site
3. You should see it indexed within 24-48 hours (usually much faster)

### Check the API Key File
Visit `https://yoursite.com/{YOUR_API_KEY}.txt` to confirm it's accessible.

## Troubleshooting

### Error: "Sitemap not found"
- Make sure you run `npm run build` before the script
- Check that your sitemap is generated in `dist/sitemap-0.xml`
- Update `SITEMAP_PATH` if your sitemap has a different name

### Error: "require is not defined"
- Make sure you're using ES modules (`import` instead of `require`)
- Check that your `package.json` has `"type": "module"`

### Status Code 400
- Verify your API key is correct
- Check that the API key file is accessible at `yoursite.com/{API_KEY}.txt`
- Ensure `SITE_URL` matches your verified domain in Bing Webmaster Tools

### Status Code 429 (Rate Limit)
- Bing has a rate limit of 10,000 URLs per day
- If you hit this, the script will fail gracefully
- URLs will be submitted on the next deployment

## Best Practices

1. **Keep API Key Secure**: Don't commit it to public repos (use environment variables for sensitive projects)
2. **Monitor Submissions**: Check Bing Webmaster Tools weekly to ensure URLs are being indexed
3. **Submit on Every Deploy**: The script is idempotent - submitting the same URL multiple times is fine
4. **Use for Updates**: When you update content, the resubmission tells Bing to re-crawl

## Additional Notes

- **IndexNow Protocol**: This uses the IndexNow protocol, which is also supported by Yandex and other search engines
- **No Cost**: Completely free, no API limits beyond rate limiting
- **Instant Results**: Most URLs appear in Bing within 1-24 hours
- **Works with DuckDuckGo**: DuckDuckGo uses Bing's index, so you get coverage there too

## Example Output

Successful submission:
```
✅ Bing accepted the submission!
   40 URLs queued for indexing
```

## Related Documentation
- [Bing IndexNow Documentation](https://www.bing.com/indexnow)
- [IndexNow Protocol Spec](https://www.indexnow.org/)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
