(function initSupabaseClient() {
    const config = window.SUPABASE_CONFIG || {};
    const hasKeys = Boolean(config.url && config.anonKey)
        && config.url !== 'YOUR_SUPABASE_PROJECT_URL'
        && config.anonKey !== 'YOUR_SUPABASE_ANON_KEY';

    if (!window.supabase || !hasKeys) {
        window.supabaseClient = null;
        return;
    }

    window.supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
})();
