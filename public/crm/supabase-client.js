
// -------------------------------------------------------------------------
// MPDC CRM Database Connector - ROBUST VERSION
// -------------------------------------------------------------------------

const SUPABASE_URL = 'https://vobbqsipyyftscyvxuja.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmJxc2lweXlmdHNjeXZ4dWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQyNDgsImV4cCI6MjA4NTcwMDI0OH0.aSxwAUb-qWZBVPQJ-s5FiGIKtu8dBlHGnuV5i0H2QHc';

let client = null;

const getDB = () => {
    if (client) return client;
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return client;
        }
    } catch (e) { console.error('Supabase Init Error:', e); }
    return null;
};

// 1. Fetch Prospects
async function fetchLeads() {
    const db = getDB();
    if (!db) return [];
    try {
        const { data: contacts, error } = await db.from('contacts').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        return (contacts || []).map(c => {
            const auto = c.automation_state || {};
            const isInsta = c.email && c.email.endsWith('@instagram.com');
            const igHandle = isInsta ? '@' + c.email.split('@')[0] : c.instagram_handle || null;
            const actualEmail = isInsta ? null : c.email;

            return {
                id: c.id,
                name: c.name || (isInsta ? igHandle : (c.email ? c.email.split('@')[0] : 'Unknown')),
                email: actualEmail,
                instagram_handle: igHandle,
                status: c.funnel_stage || 'new',
                source: c.attribution?.utm_source || c.attribution?.import_source || 'Direct',
                source_detail: c.attribution?.utm_campaign || c.attribution?.import_source || '',
                created_at: c.created_at,
                deal_value: auto.deal_value ?? (c.engagement_score * 10) ?? 1500,
                notes: auto.notes || 'No notes yet.',
                pain_point: auto.pain_point || 'General',
                active_sequence: auto.active_sequence || null
            };
        });
    } catch (e) { console.error('Fetch Error:', e); return []; }
}

// 2. Update Deal Status
async function updateLeadStatus(id, status) {
    const db = getDB();
    if (!db) return;
    const { error } = await db.from('contacts').update({ funnel_stage: status }).eq('id', id);
    if (error) console.error('Status Update Error:', error);
}

// 3. Update Deal Value & Pain Point
async function updateWorkInfo(id, value, painPoint) {
    const db = getDB();
    if (!db) return false;
    try {
        const { data: lead } = await db.from('contacts').select('automation_state').eq('id', id).single();
        const newState = {
            ...(lead?.automation_state || {}),
            deal_value: parseFloat(value) || 0,
            pain_point: painPoint
        };
        const { error } = await db.from('contacts').update({ automation_state: newState }).eq('id', id);
        if (error) throw error;
        return true;
    } catch (e) { console.error('Value Update Error:', e); return false; }
}

// 4. Update Lead Notes
async function updateLeadNotes(id, text) {
    const db = getDB();
    if (!db) return false;
    try {
        const { data: lead } = await db.from('contacts').select('automation_state').eq('id', id).single();
        const newState = { ...(lead?.automation_state || {}), notes: text };
        const { error } = await db.from('contacts').update({ automation_state: newState }).eq('id', id);
        if (error) throw error;
        return true;
    } catch (e) { console.error('Note Update Error:', e); return false; }
}

// 5. Enroll in Sequence
async function enrollInSequence(id, sequenceName) {
    const db = getDB();
    if (!db) return false;
    try {
        const { data: lead } = await db.from('contacts').select('automation_state').eq('id', id).single();
        const newState = {
            ...(lead?.automation_state || {}),
            active_sequence: sequenceName,
            enrolled_at: new Date().toISOString()
        };
        const { error } = await db.from('contacts').update({ automation_state: newState }).eq('id', id);
        if (error) throw error;
        return true;
    } catch (e) { console.error('Enroll Error:', e); return false; }
}

// 6. Create Manual Social Lead
async function createSocialLead(handle, name, painPoint, notes) {
    const db = getDB();
    if (!db) return false;
    try {
        const { error } = await db.from('contacts').insert({
            email: `${handle.replace('@', '')}@instagram.com`, // Placeholder email for DB constraints
            name: name || handle,
            funnel_stage: 'prospect',
            attribution: {
                utm_source: 'Instagram',
                import_source: 'Manual Quick-Add'
            },
            automation_state: {
                deal_value: 1500,
                pain_point: painPoint,
                notes: notes || 'New lead via DM manual add.'
            }
        });
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Create Lead Error:', e);
        return false;
    }
}

// EXPORT
window.fetchLeads = fetchLeads;
window.updateLeadStatus = updateLeadStatus;
window.updateWorkInfo = updateWorkInfo;
window.updateLeadNotes = updateLeadNotes;
window.enrollInSequence = enrollInSequence;
window.createSocialLead = createSocialLead;
