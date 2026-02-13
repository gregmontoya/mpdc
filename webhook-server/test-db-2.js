
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function listTables() {
    // There isn't a direct "list tables" in Supabase SDK, but we can try to hit the rest endpoint or query contacts
    const { data, error } = await supabase.from('contacts').select('count', { count: 'exact', head: true });
    if (error) {
        console.log('❌ Contacts Error:', error.message);
    } else {
        console.log('✅ Contacts table is online.');
    }
}

listTables();
