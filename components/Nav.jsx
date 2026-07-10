import Link from "next/link";
import { User } from "lucide-react";
import { mailtoHref } from "@/lib/data";
import CartButton from "@/components/cart/CartButton";
import { createClient } from "@/lib/supabase/server";

export default async function Nav({ settings }) {
  let user = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {}

  return (
    <header className="nav">
      <Link className="mark" href="/" aria-label="Cail Customs — home">
        <img className="mark-logo" src="/logo-mark.png" alt="Cail Customs" />
      </Link>
      <nav className="links">
        <Link href="/">shop</Link>
        <Link href="/#about">about</Link>
        <Link href="/#contact">contact</Link>
      </nav>
      <div className="nav-right">
        <CartButton />
        <Link
          className="cart-btn"
          href={user ? "/account" : "/account/login"}
          aria-label={user ? "my account" : "sign in"}
        >
          <User size={17} />
        </Link>
        <a className="pill" href={mailtoHref(settings.email, "inquiry")}>get in touch</a>
      </div>
    </header>
  );
}
