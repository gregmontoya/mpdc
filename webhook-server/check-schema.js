
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkSchema() {
    const { data, error } = await supabase.rpc('get_tables'); // This likely won't work unless defined

    // Alternative: query a system table if allowed
    const { data: tables, error: tableError } = await supabase
        .from('campaign_performance')
        .select('id')
        .limit(1);

    if (tableError) {
        console.log('❌ Table not found or error:', tableError.message);
    } else {
        console.log('✅ Table FOUND!');
    }
}

checkSchema();
