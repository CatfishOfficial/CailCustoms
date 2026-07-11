import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Refreshes the Supabase auth session cookie on every request so server
// components see an up-to-date session, and guards the /admin route.
//
// Fail-safe: if Supabase env vars are missing or the auth call throws, we let
// the request through instead of 500-ing the whole site. The /admin page also
// checks auth server-side, so protection doesn't depend on middleware alone.
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response; // not configured yet — don't crash

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isLogin = path.startsWith("/admin/login");
  const isAccountDash = path.startsWith("/account") && !path.startsWith("/account/login") && !path.startsWith("/account/signup");
  const isAccountLogin = path.startsWith("/account/login");
  const isAccountSignup = path.startsWith("/account/signup");

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const redirectTo = (pathname) => {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathname;
      return NextResponse.redirect(redirectUrl);
    };

    // Only spend an RPC on admin routes. `is_admin()` is the SECURITY DEFINER
    // function from migration 004; treat any failure as "not an admin".
    let admin = false;
    if (user && isAdmin) {
      try {
        const { data } = await supabase.rpc("is_admin");
        admin = data === true;
      } catch {
        admin = false;
      }
    }

    // The admin app requires a signed-in admin. Customers (or signed-out
    // visitors) never see it.
    if (isAdmin && !isLogin) {
      if (!user) return redirectTo("/admin/login");
      if (!admin) return redirectTo("/account");
    }

    // Send anyone already signed in away from the admin login screen — admins
    // into the admin, everyone else to their account.
    if (isLogin && user) {
      return redirectTo(admin ? "/admin" : "/account");
    }

    // Unauthenticated users hitting the account dashboard get sent to sign-in.
    if (isAccountDash && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/account/login";
      return NextResponse.redirect(redirectUrl);
    }

    // Logged-in users don't need to see the account auth pages.
    if ((isAccountLogin || isAccountSignup) && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/account";
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    // Auth check failed (network/config) — fall through and let the page
    // render. The /admin page's own server-side guard still applies.
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
