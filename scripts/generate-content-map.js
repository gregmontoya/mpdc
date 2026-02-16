import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const OUTPUT_FILE = path.join(__dirname, '../CONTENT_MAP.csv');

async function generateContentMap() {
    console.log('📊 Generating Semantic Content Map (Manual Parser)...');

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

    // CSV Header
    let csvContent = 'Title,Category,URL,Read Time,Publish Date\n';
    const stats = {};

    files.forEach(file => {
        const filePath = path.join(BLOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Simple manual parser for frontmatter
        const titleMatch = content.match(/title:\s*"(.*?)"/);
        const catMatch = content.match(/category:\s*"(.*?)"/);
        const timeMatch = content.match(/readTime:\s*"(.*?)"/);
        const dateMatch = content.match(/publishDate:\s*"(.*?)"/);

        const slug = file.replace('.md', '');
        const title = (titleMatch ? titleMatch[1] : slug).replace(/,/g, '');
        const category = (catMatch ? catMatch[1] : 'Uncategorized').replace(/,/g, '');
        const url = `https://menspostdivorcecoaching.com/learn/${slug}/`;
        const readTime = timeMatch ? timeMatch[1] : 'N/A';
        const pubDate = dateMatch ? dateMatch[1] : 'N/A';

        csvContent += `"${title}","${category}","${url}","${readTime}","${pubDate}"\n`;

        stats[category] = (stats[category] || 0) + 1;
    });

    fs.writeFileSync(OUTPUT_FILE, csvContent);
    console.log(`✅ Success! Content Map generated at: ${OUTPUT_FILE}`);
    console.log('\n--- SEMANTIC GAP ANALYSIS ---');

    Object.entries(stats).forEach(([cat, count]) => {
        const status = count < 5 ? '⚠️ THIN (Needs Nodes)' : '✅ HEALTHY';
        console.log(`${cat}: ${count} Articles [${status}]`);
    });
}

generateContentMap();
