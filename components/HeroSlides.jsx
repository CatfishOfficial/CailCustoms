"use client";

import { useState, useEffect } from "react";
import Frame from "./Frame";

function slideStyle(rel, n) {
  if (rel === 0) return { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1, zIndex: 50 };
  if (rel === n - 1) return { transform: "translateX(-120%) rotate(-6deg) scale(.96)", opacity: 0, zIndex: 5 };
  const d = rel;
  return {
    transform: `translate(${d * 12}px, ${d * 14}px) scale(${1 - d * 0.05}) rotate(${d * 1.4}deg)`,
    opacity: d <= 2 ? 1 : 0,
    zIndex: 50 - d,
  };
}

export default function HeroSlides({ slides }) {
  const n = slides.length || 1;
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || n < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 3400);
    return () => clearInterval(id);
  }, [n]);
  return (
    <div className="hero-slides">
      {slides.map((s, k) => (
        <div key={k} className="hero-slide" style={slideStyle((k - (i % n) + n) % n, n)}>
          <Frame
            tone={s.tone}
            label={s.label}
            image={s.image}
            priority={k === 0}
            quality={k === 0 ? undefined : 100}
            sizes="(max-width: 860px) 100vw, 50vw"
          />
        </div>
      ))}
    </div>
  );
}
