
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vobbqsipyyftscyvxuja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc";
const email = 'spencer.lambdin@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkLead() {
    console.log(`Checking for lead: ${email}`);

    // Check contacts table
    console.log('\n--- Searching in CONTACTS table ---');
    const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', email)
        .single();

    if (contactError) {
        console.log('Contact search error or lead not found in contacts:', contactError.message);
    } else {
        console.log('Lead found in CONTACTS table:');
        console.log(JSON.stringify(contact, null, 2));
    }

    // Check leads table
    console.log('\n--- Searching in LEADS table ---');
    const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .ilike('email', email); // Use ilike just in case

    if (leadError) {
        console.log('Lead search error:', leadError.message);
    } else if (leads && leads.length > 0) {
        console.log('Lead found in LEADS table:');
        console.log(JSON.stringify(leads, null, 2));
    } else {
        console.log('Lead not found in LEADS table.');
    }

    // Check visitor_activity
    console.log('\n--- Searching in VISITOR_ACTIVITY table ---');
    if (contact && contact.guest_id) {
        const { data: activity, error: activityError } = await supabase
            .from('visitor_activity')
            .select('*')
            .eq('guest_id', contact.guest_id)
            .order('timestamp', { ascending: false })
            .limit(10);

        if (activityError) {
            console.log('Activity search error:', activityError.message);
        } else {
            console.log(`Found ${activity.length} activity records for guest_id: ${contact.guest_id}`);
            console.log(JSON.stringify(activity, null, 2));
        }
    } else {
        console.log('No guest_id found for contact, skipping activity check or checking by email if possible.');
    }
}

checkLead();
