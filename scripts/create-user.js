const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTestUser() {
    const email = 'admin@mpdc.com';
    const password = 'Password123!';

    console.log(`Attempting to sign up ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Error signing up:', error.message);
    } else {
        console.log('User signed up successfully!', data.user.id);
        console.log('NOTE: You may need to confirm the email if email confirmation is enabled.');
    }
}

createTestUser();
