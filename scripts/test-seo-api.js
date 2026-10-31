const login = 'hello@gregmontoya.net';
const pass = '9fcdc8f058fb51f2';
const auth = Buffer.from(`${login}:${pass}`).toString('base64');

async function testConnection() {
    console.log('🌐 Testing DataForSEO Connection...');
    try {
        const response = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.status_code !== 20000) {
            console.error('❌ API Error:', data.status_message);
            return false;
        }

        console.log('✅ Connection Successful!');
        const user = data.tasks?.[0]?.result?.[0];
        if (user) {
            console.log('💰 Balance Remaining:', user.money_limit || user.balance || 'Trial Active');
        }
        return true;
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        return false;
    }
}

async function findOpportunities(seedKeywords) {
    console.log(`🔍 Finding opportunities for: "${seedKeywords.join(', ')}"...`);
    try {
        const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live', {
            method: 'POST',
            body: JSON.stringify([
                {
                    "keywords": seedKeywords,
                    "location_code": 2840, // USA
                    "language_code": "en",
                    "limit": 10
                }
            ]),
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.tasks?.[0]?.result?.[0]) {
            console.log('⚠️ No results found or API limited. Full Response:', JSON.stringify(data, null, 2));
            return;
        }

        const results = data.tasks[0].result[0].items;
        if (!results || results.length === 0) {
            console.log('⚠️ No keyword ideas found.');
            return;
        }

        console.log('\n--- 🎯 TOP OPPORTUNITIES ---');
        results.forEach((item, i) => {
            console.log(`${i + 1}. ${item.keyword}`);
            console.log(`   📊 Monthly Searches: ${item.keyword_info?.search_volume || 'N/A'}`);
            console.log(`   🔥 Competition: ${item.keyword_info?.competition_level || 'N/A'}`);
            console.log(`   💡 Intent: ${item.keyword_info?.search_intent_info?.main_intent || 'Unknown'}`);
            console.log('---------------------------');
        });
    } catch (error) {
        console.error('❌ Research Failed:', error.message);
    }
}

const run = async () => {
    const success = await testConnection();
    if (success) {
        await findOpportunities(['divorce advice for men', 'narcissistic ex wife']);
    }
};

run();
