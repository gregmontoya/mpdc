require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function countContacts() {
    const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('marketing_status', 'subscribed');

    if (error) {
        console.error('❌ Error fetching contacts:', error.message);
    } else {
        console.log(`📊 Total Subscribed Contacts: ${count}`);

        // Break down by funnel stage
        const { data: stages, error: stageError } = await supabase
            .from('contacts')
            .select('funnel_stage')
            .eq('marketing_status', 'subscribed');

        if (!stageError) {
            const counts = stages.reduce((acc, curr) => {
                acc[curr.funnel_stage] = (acc[curr.funnel_stage] || 0) + 1;
                return acc;
            }, {});
            console.log('Breakdown by Funnel Stage:', counts);
        }
    }
}

countContacts();
