import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wlfkezrhiwrjzazcotjp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_RjaHG0Wi8cnVPiyY1XAbCA_u44Z1PzB';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const isSupabaseAdminConfigured = (): boolean => {
  return (
    isSupabaseConfigured() &&
    Boolean(supabaseServiceKey) &&
    !supabaseServiceKey.includes('your-service-role')
  );
};

// Client for public browser / client component reads (enforcing RLS)
let browserClient: SupabaseClient | null = null;
export const getSupabaseBrowserClient = () => {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    });
  }
  return browserClient;
};

// Server-side anonymous client (enforcing RLS)
export const getSupabaseServerClient = () => {
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};

// Server-side admin client (bypasses RLS only when explicitly required on the server)
export const getSupabaseAdminClient = () => {
  if (!isSupabaseAdminConfigured()) {
    // If service role key is not provided but anon key is, fallback to anon with authenticated user context
    if (isSupabaseConfigured()) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
