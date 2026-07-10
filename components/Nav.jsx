import Link from "next/link";
import { mailtoHref } from "@/lib/data";
import CartButton from "@/components/cart/CartButton";

export default function Nav({ settings }) {
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
        <a className="pill" href={mailtoHref(settings.email, "inquiry")}>get in touch</a>
      </div>
    </header>
  );
}
