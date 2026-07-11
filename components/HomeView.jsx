"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Frame from "./Frame";
import HeroSlides from "./HeroSlides";
import Marquee from "./Marquee";
import ProductCard from "./ProductCard";
import { countInTree, iconsFor, DRAWER, mailtoHref, telHref, slugify, topLevel } from "@/lib/data";

export default function HomeView({ data }) {
  const { settings, categories, products, heroSlides } = data;
  const heroMediaRef = useRef(null);
  const revealRefs = useRef([]);
  const setReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };
  const featured = products.filter((p) => p.featured);

  useEffect(() => {
    const els = revealRefs.current.filter(Boolean);
    if ("IntersectionObserver" in window && els.length) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
      );
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (heroMediaRef.current) heroMediaRef.current.style.transform = `translateY(${y * -0.12}px)`;
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CAIL CUSTOMS &nbsp;//&nbsp; {settings.location.toUpperCase()}</p>
          <h1 className="hero-title">
            <span className="line l1">{settings.heroLines[0]}</span>
            <span className="line l2">{settings.heroLines[1]}</span>
            <span className="line l3">{settings.heroLines[2]}</span>
          </h1>
          <p className="hero-sub">{settings.heroSub}</p>
          <div className="hero-actions">
            <a
              href="#shop"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              browse the shop
            </a>
            <a href={mailtoHref(settings.email, "hi")} className="btn ghost">say hi</a>
          </div>
        </div>
        <div className="hero-media" ref={heroMediaRef}>
          <HeroSlides slides={heroSlides} />
        </div>
      </section>

      <div className="marquees">
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, g) => (
              <div className="marquee-group" key={g}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Marquee key={i} text={settings.marquee} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="shop" id="shop" ref={setReveal}>
        <div className="section-head">
          <span className="sec-eyebrow">the shop</span>
          <h2 className="sec-title">Shop by category</h2>
          <p className="sec-note">tap a lane to see what's in it — or scroll down for a few fresh picks.</p>
        </div>
        <div className="cat-grid">
          {topLevel(categories).map((c, i) => {
            const n = countInTree(products, categories, c);
            return (
            <Link
              key={c.name}
              href={`/shop/${slugify(c.name)}`}
              className="catcard"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className="catcard-media">
                <Frame tone={c.tone} image={c.image} />
                <span className="catcard-count">
                  {n} {n === 1 ? "thing" : "things"}
                </span>
                <div className="catcard-overlay">
                  <span className="catcard-name">{c.name}</span>
                  <span className="catcard-go">browse →</span>
                </div>
              </div>
              <div className="drawer" aria-hidden="true">
                {iconsFor(c.name).map((Icon, k) => {
                  const d = DRAWER[k] || DRAWER[0];
                  return (
                    <span
                      key={k}
                      className="drawer-icon"
                      style={{ left: `${d.left}%`, color: d.color, "--peek": `${d.peek}px`, "--rot": `${d.rot}deg`, transitionDelay: `${d.delay}s` }}
                    >
                      <Icon size={48} strokeWidth={2} />
                    </span>
                  );
                })}
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="shop featured" ref={setReveal}>
          <div className="section-head">
            <span className="sec-eyebrow">fresh picks</span>
            <h2 className="sec-title">A few favorites</h2>
          </div>
          <div className="grid">
            {featured.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
        </section>
      )}

      <section className="about" id="about" ref={setReveal}>
        <p className="about-eyebrow">who's behind it</p>
        <p className="about-line">{settings.about}</p>
      </section>

      <section className="contact" id="contact" ref={setReveal}>
        <div className="contact-grid">
          <h2 className="contact-title">
            See something?<br />Let's talk.
          </h2>
          <div className="contact-right">
            <a className="contact-link" href={`mailto:${settings.email}`}>
              <span className="cl-label">email</span>
              <span className="cl-value">{settings.email}</span>
            </a>
            <a className="contact-link" href={telHref(settings.phone)}>
              <span className="cl-label">phone</span>
              <span className="cl-value">{settings.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
