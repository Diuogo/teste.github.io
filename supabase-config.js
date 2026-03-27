const SUPABASE_URL = 'https://ggpjinhvxvieaeulhdyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncGppbmh2eHZpZWFldWxoZHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTg1MzUsImV4cCI6MjA3Njk3NDUzNX0.2TsTZEQaJ8Dq7BRLm7SVjjA8SH9JWphQ6kF7OFztiug';

let supabase = null;

function isConfigured() {
    return !SUPABASE_URL.includes('YOUR_PROJECT_ID') && SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
}

function initSupabase() {
    if (!isConfigured()) {
        console.error('❌ Supabase não configurado');
        return null;
    }
    if (typeof window.supabase?.createClient !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized');
    } else {
        console.error('❌ Supabase library not loaded');
    }
    return supabase;
}

window.supabaseConfig = {
    init: initSupabase,
    getClient: () => supabase,
    isConfigured
};