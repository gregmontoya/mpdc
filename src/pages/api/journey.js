import { createClient } from '@supabase/supabase-js';

export const prerender = true;

export async function GET({ request, url }) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${import.meta.env.ADMIN_API_SECRET}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized Access' }), { status: 401 });
    }

    const identity = url.searchParams.get('identity');
    if (!identity) {
        return new Response(JSON.stringify({ error: 'Identity required' }), { status: 400 });
    }

    const supabase = createClient(
        import.meta.env.SUPABASE_URL,
        import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // 1. Fetch from Contacts Hub
        const { data: contact } = await supabase
            .from('contacts')
            .select('*')
            .or(`email.eq.${identity},guest_id.eq.${identity}`)
            .maybeSingle();

        // 2. Fetch Activity
        let activity = [];
        if (contact) {
            const { data: act } = await supabase
                .from('visitor_activity')
                .select('*')
                .eq('guest_id', contact.guest_id || '')
                .order('created_at', { ascending: false });
            activity = act || [];
        }

        return new Response(JSON.stringify({ contact, activity }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
