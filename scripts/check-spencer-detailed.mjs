
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vobbqsipyyftscyvxuja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc";
const email = 'spencer.lambdin@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkLead() {
    console.log(`Checking for lead: ${email}`);

    // Check contacts table
    const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', email)
        .single();

    if (contactError) {
        console.log('Contact not found or error:', contactError.message);
        return;
    }

    console.log('Lead found in CONTACTS table:');
    console.log(JSON.stringify(contact, null, 2));

    // Check visitor_activity
    console.log('\n--- VISITOR ACTIVITY ---');
    // Let's first check columns in visitor_activity
    const { data: sample, error: sampleError } = await supabase.from('visitor_activity').select('*').limit(1);
    if (sampleError) {
        console.log('Error checking visitor_activity schema:', sampleError.message);
    } else {
        const columns = Object.keys(sample[0] || {});
        console.log('Visitor Activity Columns:', columns);

        let query = supabase.from('visitor_activity').select('*').eq('guest_id', contact.guest_id);

        if (columns.includes('created_at')) {
            query = query.order('created_at', { ascending: false });
        } else if (columns.includes('timestamp')) {
            query = query.order('timestamp', { ascending: false });
        }

        const { data: activity, error: activityError } = await query.limit(20);

        if (activityError) {
            console.log('Activity query error:', activityError.message);
        } else {
            console.log(`Found ${activity.length} activity records:`);
            activity.forEach(a => {
                console.log(`- [${a.created_at || a.timestamp}] ${a.path} (Referrer: ${a.referrer})`);
            });
        }
    }

    // Check if he is in profiles (Student table)
    console.log('\n--- STUDENT PROFILE ---');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profileError) {
        console.log('No student profile found (He has not purchased).');
    } else {
        console.log('STUDENT PROFILE FOUND:');
        console.log(JSON.stringify(profile, null, 2));
    }
}

checkLead();
