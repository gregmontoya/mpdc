const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// MOCK ENV VARS (I will fill these with what we know)
const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';
const RESEND_API_KEY = 're_TTohkdN3_CVLr4gT9G9HWzTueBFKBiEeJ';

// Initialize Clients
const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// DATA FROM YOUR STRIPE EVENT (Step 1040)
const email = "gregmontoya1@gmail.com";
const name = "Greg";

async function runDebug() {
    console.log('🐞 STARTING DEBUG SCRIPT...');
    console.log(`📧 Processing for: ${email}`);

    // 1. CRM Insert
    try {
        console.log('1️⃣ Testing Supabase Insert...');
        const { error } = await supabase.from('profiles').insert([
            { email: email, name: name, access_level: 'student' }
        ]);
        if (error) {
            console.error('❌ Supabase Error:', error);
        } else {
            console.log('✅ Supabase Insert Success!');
        }
    } catch (err) {
        console.error('❌ Supabase CRASHed:', err);
    }

    // 2. Email Send
    try {
        console.log('2️⃣ Testing Resend Email...');

        // Generate password
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));

        const loginUrl = 'https://menspostdivorcecoaching.com/system/login.html';
        const emailHTML = `
            <h1>Welcome ${name}!</h1>
            <p>Login at: ${loginUrl}</p>
            <p>Password: ${password}</p>
        `;

        const { data, error } = await resend.emails.send({
            from: 'Men\'s Divorce Mindset System <onboarding@resend.dev>',
            to: email,
            subject: '🐞 Debug Test Email',
            html: emailHTML
        });

        if (error) {
            console.error('❌ Resend API Returned Error:', error);
            // This is likely where the 500 comes from!
        } else {
            console.log('✅ Resend Success! ID:', data.id);
        }

    } catch (err) {
        console.error('❌ Resend CRASHed (Exception):', err);
    }

    console.log('🏁 DEBUG FINISHED');
}

runDebug();
