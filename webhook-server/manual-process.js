
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { processAutomations } = require('./automation-processor');

async function run() {
    console.log('🚀 Manually triggering automation processing...');
    try {
        const results = await processAutomations();
        console.log('✅ Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

run();
