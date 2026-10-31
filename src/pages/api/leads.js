import { createClient } from '@supabase/supabase-js';

export const prerender = true; // Ensure this is a dynamic API route

export async function GET({ request }) {
    // 1. AUTH CHECK: Ensure only you can call this
    // We check for a session or a secure admin token in the header
    const authHeader = request.headers.get('Authorization');

    // For now, we'll use an environment variable for the secret admin token
    // In a full production setup, this would check Firebase Auth
    if (!authHeader || authHeader !== `Bearer ${import.meta.env.ADMIN_API_SECRET}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized Access' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Initialize Secure Supabase Client (Server-Side using Service Key)
    const supabase = createClient(
        import.meta.env.SUPABASE_URL,
        import.meta.env.SUPABASE_SERVICE_ROLE_KEY // Hidden secret key
    );

    try {
        // Fetch Unified Lead Feed
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('last_active_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
