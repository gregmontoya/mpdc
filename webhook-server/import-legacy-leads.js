require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const legacyLeads = [
    { email: "david@concreterepairs.com.au", country: "Australia" },
    { email: "madsen.dallin93@gmail.com", country: "United States" },
    { email: "samisworld@gmail.com", country: "Spain" },
    { email: "simon_corbett@hotmail.com", country: "United Kingdom" },
    { email: "dbpatel102693@gmail.com", country: "United States" },
    { email: "benjaminmauney@hotmail.com", country: "" },
    { email: "amit174@yahoo.com", country: "United States" },
    { email: "robertdeer@hotmail.com", country: "Australia" },
    { email: "harisamandas@yahoo.com", country: "Malaysia" },
    { email: "mpritts88@gmail.com", country: "United States" },
    { email: "siddhant199336@gmail.com", country: "India" },
    { email: "timothy.lwq@gmail.com", country: "Vietnam" },
    { email: "damonpshine@gmail.com", country: "United States" },
    { email: "weuring2@zonnet.nl", country: "Netherlands" },
    { email: "filippavlovski@gmail.com", country: "Serbia" },
    { email: "haleyrobert@icloud.com", country: "Canada" },
    { email: "muddyjeeps@gmail.com", country: "United States" },
    { email: "1977tritons@gmail.com", country: "United States" }
];

async function importLeads() {
    console.log(`🚀 Importing ${legacyLeads.length} legacy leads...`);

    for (const lead of legacyLeads) {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .upsert({
                    email: lead.email,
                    funnel_stage: 'prospect',
                    tags: ['legacy_import'],
                    attribution: { country: lead.country, import_source: "legacy_list_feb_2026" },
                    automation_state: {
                        welcome_v1_sent: true,
                        welcome_v1_date: new Date().toISOString(),
                        notes: "Imported legacy lead - automation suppressed"
                    }
                }, { onConflict: 'email' });

            if (error) {
                console.error(`❌ Error importing ${lead.email}:`, error.message);
            } else {
                console.log(`✅ Success: ${lead.email}`);
            }
        } catch (err) {
            console.error(`❌ Unexpected error for ${lead.email}:`, err.message);
        }
    }

    console.log('🏁 Import complete.');
}

importLeads();
