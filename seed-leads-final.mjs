
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const data = [
    {
        email: '@dad_life_struggles', // Using email field for handle temporarily
        name: 'Mark Henderson',
        status: 'new',
        source: 'instagram_manual',
        created_at: new Date().toISOString()
    },
    {
        email: '@fitness_mike_88',
        name: 'Mike Ross',
        status: 'convo',
        source: 'instagram_manual',
        created_at: new Date(Date.now() - 86400000).toISOString() // yesterday
    },
    {
        email: '@finance_guy_steve',
        name: 'Steve Miller',
        status: 'qualifying',
        source: 'instagram_manual',
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
        email: '@custody_warrior',
        name: 'James Wright',
        status: 'booked',
        source: 'instagram_manual',
        created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
];

async function run() {
    console.log('Seeding data with adjusted schema...');

    const { error } = await supabase.from('leads').insert(data);

    if (error) {
        console.log('Seed Error:', error.message);
    } else {
        console.log('Success! Added 4 example prospects.');
    }
}

run();
