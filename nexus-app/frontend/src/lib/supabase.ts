import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export function createClient() {
    if (!isSupabaseConfigured) {
        // Return a mock client during build or if not configured
        return null;
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();

// Auth helper functions - return error if Supabase not configured
export async function signUp(email: string, password: string) {
    if (!supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signIn(email: string, password: string) {
    if (!supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    if (!supabase) {
        return { error: { message: 'Supabase not configured' } };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function signInWithGoogle() {
    if (!supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { data, error };
}

export async function signInWithGitHub() {
    if (!supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { data, error };
}

export async function getCurrentUser() {
    if (!supabase) {
        return { user: null, error: { message: 'Supabase not configured' } };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

export async function getSession() {
    if (!supabase) {
        return { session: null, error: { message: 'Supabase not configured' } };
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}
