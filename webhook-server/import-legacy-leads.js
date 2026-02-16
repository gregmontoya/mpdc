const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const prospects = [
    { name: 'Ben Mauney', email: 'benjaminmauney@hotmail.com' },
    { name: 'Harmen Weuring', email: 'Weuring2@zonnet.nl' }
];

async function importLeads() {
    console.log('🚀 Importing legacy Manychat leads...');

    for (const lead of prospects) {
        try {
            const normalizedEmail = lead.email.toLowerCase().trim();

            const { data: existing } = await supabase
                .from('contacts')
                .select('*')
                .eq('email', normalizedEmail)
                .maybeSingle();

            const updateData = {
                email: normalizedEmail,
                name: lead.name,
                marketing_status: 'subscribed',
                funnel_stage: 'prospect',
                tags: existing?.tags ? [...new Set([...existing.tags, 'manychat_legacy', 'manychat_follower'])] : ['manychat_legacy', 'manychat_follower'],
                attribution: {
                    utm_source: 'Manychat',
                    utm_medium: 'Legacy_Import',
                    utm_campaign: 'historical_sync'
                },
                last_active_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('contacts')
                .upsert(updateData, { onConflict: 'email' });

            if (error) {
                console.error(`❌ Failed to import ${lead.email}:`, error.message);
            } else {
                console.log(`✅ ${lead.name} (${lead.email}) imported successfully.`);
            }
        } catch (err) {
            console.error(`❌ Error processing ${lead.email}:`, err.message);
        }
    }

    console.log('✨ Import complete.');
}

importLeads();
