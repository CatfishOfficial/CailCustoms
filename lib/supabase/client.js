"use client";

import { createBrowserClient } from "@supabase/ssr";

// Single browser client for the whole app. Reusing one instance keeps the auth
// session (stored in cookies) consistent, so admin writes reliably run as the
// logged-in user and RLS is satisfied. Creating a new client per call risks
// firing queries before the session hydrates — which reads as "won't save".
let browserClient;

export function createClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return browserClient;
}
