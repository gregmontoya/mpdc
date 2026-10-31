import { createClient } from '@supabase/supabase-js';

export const prerender = true;

export async function GET({ request }) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${import.meta.env.ADMIN_API_SECRET}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized Access' }), { status: 401 });
    }

    const supabase = createClient(
        import.meta.env.SUPABASE_URL,
        import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
