#!/usr/bin/env node

/**
 * Automated Meta Description Generator (Local Version)
 * Generates SEO-optimized meta descriptions from blog content
 * without requiring external API calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const SEO_CONFIG_PATH = path.join(__dirname, '../src/data/seo-config.json');

/**
 * Extract metadata from blog post frontmatter
 */
function extractBlogMetadata(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(/title:\s*["'](.+?)["']/);
    const descMatch = content.match(/description:\s*["'](.+?)["']/);
    const aeoMatch = content.match(/aeoSummary:\s*["'](.+?)["']/);
    const slug = path.basename(filePath, '.md');

    if (!titleMatch) {
        return null;
    }

    // Extract first paragraph of content (after frontmatter)
    const contentBody = content.split('---')[2] || '';
    const firstParagraph = contentBody
        .split('\n')
        .find(line => line.trim().length > 50 && !line.startsWith('#'));

    return {
        slug,
        title: titleMatch[1],
        existingDescription: descMatch?.[1],
        aeoSummary: aeoMatch?.[1],
        firstParagraph: firstParagraph?.trim(),
        url: `/learn/${slug}`
    };
}

/**
 * Generate SEO-optimized meta description
 */
function generateMetaDescription(metadata) {
    const { title, aeoSummary, firstParagraph, existingDescription } = metadata;

    // If there's already a good description, keep it
    if (existingDescription && existingDescription.length >= 140 && existingDescription.length <= 160) {
        return { description: existingDescription, source: 'existing' };
    }

    // Priority 1: Use AEO summary if it exists and fits
    if (aeoSummary) {
        const cleaned = aeoSummary
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleaned.length >= 140 && cleaned.length <= 160) {
            return { description: cleaned, source: 'aeo' };
        }

        // Truncate if too long
        if (cleaned.length > 160) {
            return {
                description: cleaned.substring(0, 157) + '...',
                source: 'aeo-truncated'
            };
        }
    }

    // Priority 2: Use first paragraph
    if (firstParagraph) {
        const cleaned = firstParagraph
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
            .replace(/[*_#]/g, '') // Remove markdown formatting
            .replace(/\s+/g, ' ')
            .trim();

        if (cleaned.length >= 140 && cleaned.length <= 160) {
            return { description: cleaned, source: 'first-paragraph' };
        }

        if (cleaned.length > 160) {
            return {
                description: cleaned.substring(0, 157) + '...',
                source: 'first-paragraph-truncated'
            };
        }
    }

    // Priority 3: Generate from title
    const mainTopic = title
        .replace(/\|.*$/, '')
        .replace(/[:?!]/g, '')
        .trim();

    const templates = [
        `Discover ${mainTopic.toLowerCase()}. Expert strategies for divorced men to rebuild their life, reclaim their identity, and create a powerful comeback.`,
        `Learn ${mainTopic.toLowerCase()}. Tactical guide for men navigating divorce with proven frameworks for recovery, growth, and long-term success.`,
        `Master ${mainTopic.toLowerCase()}. Science-backed strategies to help divorced men stop the spiral, rebuild their frame, and design their ideal future.`,
        `${mainTopic}. Complete guide for divorced men with actionable tactics to overcome challenges, rebuild confidence, and create lasting transformation.`
    ];

    const description = templates.find(t => t.length >= 150 && t.length <= 160) || templates[0];

    if (description.length > 160) {
        return {
            description: description.substring(0, 157) + '...',
            source: 'generated-truncated'
        };
    }

    return { description, source: 'generated' };
}

/**
 * Update seo-config.json with new meta descriptions
 */
function updateSeoConfig(updates) {
    const seoConfig = JSON.parse(fs.readFileSync(SEO_CONFIG_PATH, 'utf8'));

    let updatedCount = 0;
    let addedCount = 0;
    let keptCount = 0;

    for (const [url, data] of Object.entries(updates)) {
        if (seoConfig[url]) {
            if (data.source === 'existing') {
                keptCount++;
                console.log(`  ✓ Kept existing: ${url}`);
            } else {
                seoConfig[url].description = data.description;
                updatedCount++;
                console.log(`  ✓ Updated (${data.source}): ${url}`);
            }
        } else {
            seoConfig[url] = {
                title: `${data.title} | MPDC`,
                description: data.description
            };
            addedCount++;
            console.log(`  + Added new: ${url}`);
        }
    }

    // Write back to file with proper formatting
    fs.writeFileSync(
        SEO_CONFIG_PATH,
        JSON.stringify(seoConfig, null, 4),
        'utf8'
    );

    return { updatedCount, addedCount, keptCount };
}

/**
 * Main execution
 */
function main() {
    console.log('\n========================================');
    console.log('  Meta Description Generator (Local)');
    console.log('========================================\n');

    // Get all blog posts
    const blogFiles = fs.readdirSync(BLOG_DIR)
        .filter(file => file.endsWith('.md') && !file.includes('.backup'));

    console.log(`Found ${blogFiles.length} blog posts\n`);

    const updates = {};
    let processedCount = 0;

    for (const file of blogFiles) {
        const filePath = path.join(BLOG_DIR, file);
        const metadata = extractBlogMetadata(filePath);

        if (!metadata) continue;

        console.log(`Processing: ${metadata.slug}...`);

        const { description, source } = generateMetaDescription(metadata);

        updates[metadata.url] = {
            title: metadata.title,
            description: description,
            source: source
        };

        console.log(`  ✓ ${source} (${description.length} chars)`);
        console.log(`  "${description}"\n`);

        processedCount++;
    }

    // Update seo-config.json
    console.log('\n========================================');
    console.log('Updating seo-config.json...\n');
    const { updatedCount, addedCount, keptCount } = updateSeoConfig(updates);

    console.log('\n========================================');
    console.log('  Summary');
    console.log('========================================');
    console.log(`Processed: ${processedCount} articles`);
    console.log(`Updated: ${updatedCount} meta descriptions`);
    console.log(`Added: ${addedCount} new entries`);
    console.log(`Kept existing: ${keptCount} descriptions`);
    console.log('✅ Complete!\n');
}

// Run the script
main();
