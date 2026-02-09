
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const data = [
    {
        instagram_handle: '@dad_life_struggles',
        name: 'Mark Henderson',
        status: 'new',
        pain_point: 'custody',
        notes: 'Replied to story about co-parenting challenges. Seems frustrated with ex.',
        source: 'instagram_manual',
        created_at: new Date().toISOString()
    },
    {
        instagram_handle: '@fitness_mike_88',
        name: 'Mike Ross',
        status: 'convo',
        pain_point: 'emotional',
        notes: 'Asking about the mental reset module. Recently separated.',
        source: 'instagram_manual',
        created_at: new Date(Date.now() - 86400000).toISOString() // yesterday
    },
    {
        instagram_handle: '@finance_guy_steve',
        name: 'Steve Miller',
        status: 'qualifying',
        pain_point: 'financial',
        notes: 'Budget is tight due to alimony. Needs payment plan info.',
        source: 'instagram_manual',
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
        instagram_handle: '@custody_warrior',
        name: 'James Wright',
        status: 'booked',
        pain_point: 'custody',
        notes: 'Call booked for Tuesday. Major custody battle ongoing.',
        source: 'instagram_manual',
        created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
];

async function run() {
    console.log('Seeding data...');
    const { error } = await supabase.from('leads').insert(data);
    if (error) console.error('Error:', error);
    else console.log('Successfully added example prospects!');
}

run();
