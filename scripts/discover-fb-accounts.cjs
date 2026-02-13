
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../webhook-server/.env.local') });

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

async function discoverAdAccounts() {
    console.log('🔍 Searching for Facebook Ad Accounts associated with your token...');

    if (!FB_ACCESS_TOKEN) {
        console.error('❌ Missing FB_ACCESS_TOKEN in .env.local');
        return;
    }

    try {
        const url = `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${FB_ACCESS_TOKEN}&fields=name,account_id,id,currency`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            throw new Error(JSON.stringify(data.error));
        }

        const accounts = data.data;

        if (!accounts || accounts.length === 0) {
            console.log('⚠️ No ad accounts found for this token.');
            return;
        }

        console.log('\n✅ Found Ad Accounts:');
        accounts.forEach(acc => {
            console.log(`----------------------------------`);
            console.log(`Name: ${acc.name}`);
            console.log(`Account ID: ${acc.account_id}`);
            console.log(`Graph API ID: ${acc.id}`);
            console.log(`Currency: ${acc.currency}`);
        });
        console.log(`\n👉 Copy the "Graph API ID" (starts with act_) and put it in your .env.local as FB_AD_ACCOUNT_ID`);

    } catch (error) {
        console.error('❌ Discovery Error:', error.message);
    }
}

discoverAdAccounts();
