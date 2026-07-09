import Link from "next/link";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { telHref, slugify } from "@/lib/data";

export default function Footer({ settings: s, categories }) {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-lead">
          <img className="foot-logo" src="/logo-full.png" alt="Cail Customs" />
          <h2 className="foot-statement">{s.statement}</h2>
          <div className="foot-social">
            <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={s.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
            <a href={`mailto:${s.email}`} aria-label="Email"><Mail size={18} /></a>
            <a href={telHref(s.phone)} aria-label="Phone"><Phone size={18} /></a>
          </div>
          <p className="foot-addr"><MapPin size={15} /> {s.location}</p>
        </div>
        <div className="foot-cols">
          <div className="foot-col">
            <span className="foot-h">shop</span>
            {categories.map((c) => (
              <Link key={c.name} href={`/shop/${slugify(c.name)}`}>{c.name.toLowerCase()}</Link>
            ))}
          </div>
          <div className="foot-col">
            <span className="foot-h">studio</span>
            <Link href="/">home</Link>
            <Link href="/#about">about</Link>
            <Link href="/#contact">contact</Link>
            <Link href="/admin">admin</Link>
          </div>
          <div className="foot-col">
            <span className="foot-h">reach</span>
            <a href={`mailto:${s.email}`}>{s.email}</a>
            <a href={telHref(s.phone)}>{s.phone}</a>
          </div>
        </div>
      </div>

      <div className="foot-bigmark" aria-hidden="true"><span>{s.bigmark}</span></div>

      <div className="foot-base">
        <span className="foot-copy">© {new Date().getFullYear()} cail customs · {s.location.toLowerCase()}</span>
        <span className="foot-tag">{s.tagline}</span>
      </div>
    </footer>
  );
}
