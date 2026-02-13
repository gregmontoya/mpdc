
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function testTable() {
    const { data, error } = await supabase.from('campaign_performance').select('*').limit(1);
    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Table is accessible. Existing rows:', data.length);
    }
}

testTable();
