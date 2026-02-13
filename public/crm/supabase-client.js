
// Initialize Supabase Client
const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

let supabase;

if (typeof createClient !== 'undefined') {
    window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
} else {
    console.error('Supabase SDK not loaded');
}

// Data Access Layer

// Fetch all leads for the board
async function fetchLeads() {
    if (!supabase) return [];

    // Select all fields, order by newest first
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
    return data;
}

// Add a new lead
async function addLead(leadData) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('leads')
        .insert([{
            instagram_handle: leadData.handle,
            name: leadData.name,
            status: leadData.status, // new, convo, qualifying, booked
            pain_point: leadData.painPoint,
            notes: leadData.notes,
            source: 'instagram_manual',
            created_at: new Date().toISOString()
        }])
        .select();

    if (error) {
        console.error('Error adding lead:', error);
        alert('Failed to save to database: ' + error.message);
        return null;
    }
    return data[0];
}

// Update lead status (drag and drop)
async function updateLeadStatus(leadId, newStatus) {
    if (!supabase) return;

    const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

    if (error) {
        console.error('Error updating status:', error);
    }
}
