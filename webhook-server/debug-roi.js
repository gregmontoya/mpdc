
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkData() {
    console.log('--- Campaign Performance Data ---');
    const { data: perf, error: perfError } = await supabase.from('campaign_performance').select('*');
    if (perfError) console.error('Perf Error:', perfError.message);
    else console.log(JSON.stringify(perf, null, 2));

    console.log('\n--- Contacts with Attribution ---');
    const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('name, email, attribution, funnel_stage')
        .not('attribution', 'is', null)
        .limit(10);
    if (contactsError) console.error('Contacts Error:', contactsError.message);
    else console.log(JSON.stringify(contacts, null, 2));
}

checkData();
