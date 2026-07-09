"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Uses the logged-in user's session (cookies),
// so admin writes run as the authenticated team member and RLS is enforced.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
