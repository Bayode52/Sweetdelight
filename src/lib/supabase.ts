import { createClient } from '@supabase/supabase-js';

// These fallbacks exist only to satisfy Next.js build-time analysis.
// In production, both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder';

// Check if the service key is actually set (and not just the placeholder from .env.local)
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isPlaceholder = rawServiceKey === 'your_supabase_service_role_key' || !rawServiceKey;

if (isPlaceholder && typeof window === 'undefined') {
    console.warn('⚠️ [Supabase] SUPABASE_SERVICE_ROLE_KEY is missing or using placeholder. Admin operations may fail or fall back to Anon permissions.');
}

const supabaseServiceKey = isPlaceholder ? supabaseAnonKey : rawServiceKey;

// Public client — for client-side and anon operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — for server-side privileged operations (bypasses RLS)
// Never expose this to the client!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});


