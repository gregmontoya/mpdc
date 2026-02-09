const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testLogin() {
    const email = 'admin@mpdc.com';
    const password = 'Password123!';

    console.log(`Attempting to login ${email}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Error logging in:', error.message);
    } else {
        console.log('Login successful!', data.user.id);
    }
}

testLogin();
