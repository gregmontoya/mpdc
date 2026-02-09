
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const data = [
    {
        // Try 'handle' instead of 'instagram_handle' if the other failed? 
        // Or maybe just put it in notes if schema is strict?
        // Let's try to fetch one first to see if we can guess schema.
        instagram_handle: '@dad_life_struggles',
        name: 'Mark Henderson',
        status: 'new',
        // pain_point: 'custody', // Commenting out potentially missing columns
        notes: 'Replied to story about co-parenting challenges.',
        source: 'instagram_manual',
        created_at: new Date().toISOString()
    }
];

async function run() {
    console.log('Attempting to seed...');

    // First, try to read to see if we can.
    const { data: existing, error: readError } = await supabase.from('leads').select('*').limit(1);
    if (readError) console.log('Read Error:', readError.message);
    else if (existing.length > 0) console.log('Existing row keys:', Object.keys(existing[0]));
    else console.log('Table is empty, cannot infer columns.');

    // If table is empty, we just have to guess. 
    // The previous error was specifically about instagram_handle. 
    // Let's try inserting WITHOUT instagram_handle just to see if it works.

    const { error } = await supabase.from('leads').insert([
        {
            name: 'Test Record',
            source: 'test',
            status: 'new'
        }
    ]);

    if (error) {
        console.log('Insert Test Error:', error.message);
        // If "instagram_handle" error persists even when NOT sending it, then it's not us sending it? 
        // No, the error "Could not find..." usually means we sent a key that doesn't exist.
    } else {
        console.log('Insert Test Success! Columns name, source, status exist.');
    }
}

run();
