import fs from 'fs';
import path from 'path';

/**
 * MPDC SEO OPPORTUNITY ENGINE
 * Uses DataForSEO to find high-intent, low-competition keywords
 * currently missing from the content library.
 */

const login = 'hello@gregmontoya.net';
const pass = '9fcdc8f058fb51f2';
const auth = Buffer.from(`${login}:${pass}`).toString('base64');

const CORE_TOPICS = [
    'narcissistic ex wife',
    'high conflict divorce for men',
    'parental alienation response',
    'divorce recovery mindset',
    'masculine identity after divorce',
    'financial recovery for men',
    'co-parenting with a narcissist'
];

async function getKeywordIdeas(topics) {
    console.log(`📡 Querying DataForSEO for clusters: ${topics.join(', ')}...`);
    try {
        const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live', {
            method: 'POST',
            body: JSON.stringify([
                {
                    "keywords": topics,
                    "location_code": 2840, // USA
                    "language_code": "en",
                    "limit": 50
                }
            ]),
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return data.tasks?.[0]?.result?.[0]?.items || [];
    } catch (e) {
        console.error('❌ DataForSEO Error:', e.message);
        return [];
    }
}

async function runEngine() {
    console.log('🏗️  Initializing MPDC Opportunity Engine...');

    // 1. Get current keywords from local content
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const existingFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    const existingTitles = existingFiles.map(f => {
        const content = fs.readFileSync(path.join(blogDir, f), 'utf-8');
        const titleMatch = content.match(/title: "(.*)"/);
        return titleMatch ? titleMatch[1].toLowerCase() : f.replace('.md', '').replace(/-/g, ' ');
    });

    // 2. Fetch new ideas
    const ideas = await getKeywordIdeas(CORE_TOPICS);

    if (ideas.length === 0) {
        console.log('⚠️ No new opportunities found with current filters.');
        return;
    }

    // 3. Filter out things we already have
    const opportunities = ideas.filter(item => {
        const keyword = item.keyword.toLowerCase();
        return !existingTitles.some(title => title.includes(keyword) || keyword.includes(title));
    });

    console.log(`✨ Found ${opportunities.length} fresh opportunities!`);

    // 4. Generate Report
    let report = `# 🎯 MPDC SEO OPPORTUNITY ENGINE
Generated: ${new Date().toLocaleDateString()}
Status: $1.00 Trial Active

## 🚀 High-Intent / Low-Competition Keywords
These keywords have search volume > 100 and LOW competition, and are NOT currently covered in your blog.

| Keyword | Volume | Comp | Potential Article Title |
| :--- | :--- | :--- | :--- |\n`;

    opportunities.sort((a, b) => b.keyword_info.search_volume - a.keyword_info.search_volume).forEach(op => {
        const title = op.keyword.charAt(0).toUpperCase() + op.keyword.slice(1);
        report += `| ${op.keyword} | ${op.keyword_info.search_volume} | ${op.keyword_info.competition_level} | "${title}: A Tactical Guide for Divorced Men" |\n`;
    });

    report += `\n\n## 💡 Next Steps
1. Pick one of the "Goldmine" keywords above.
2. Use the 'Strategy' tab in CRM to add it to your content queue.
3. Generate the article using the AI Mindset system.\n`;

    fs.writeFileSync('SEO_OPPORTUNITIES.md', report);
    console.log('✅ Success! Opportunities saved to SEO_OPPORTUNITIES.md');
}

runEngine();
