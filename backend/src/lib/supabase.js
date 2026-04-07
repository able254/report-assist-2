const { createClient } = require('@supabase/supabase-js');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function createSupabaseClients() {
  const isTest = process.env.NODE_ENV === 'test';
  const url = process.env.SUPABASE_URL || (isTest ? 'http://localhost:54321' : requireEnv('SUPABASE_URL'));
  const anonKey = process.env.SUPABASE_ANON_KEY || (isTest ? 'test-anon-key' : requireEnv('SUPABASE_ANON_KEY'));
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

  const supabaseAnon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const supabaseAdmin = serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  return { supabaseAnon, supabaseAdmin };
}

module.exports = { createSupabaseClients };

