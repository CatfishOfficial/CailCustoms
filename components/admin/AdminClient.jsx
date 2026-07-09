"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, LogOut, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_DATA, uid } from "@/lib/data";
import Frame from "@/components/Frame";
import Field from "./Field";
import ToneField from "./ToneField";
import ImageInput from "./ImageInput";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : uid();

// ---- persistence: push the full admin state to Supabase (reconcile by id) ----
async function deleteMissing(supabase, table, keepIds) {
  const { data: rows, error } = await supabase.from(table).select("id");
  if (error) throw error;
  const keep = new Set(keepIds);
  const toDelete = (rows || []).map((r) => r.id).filter((id) => !keep.has(id));
  if (toDelete.length) {
    const { error: delErr } = await supabase.from(table).delete().in("id", toDelete);
    if (delErr) throw delErr;
  }
}

async function flush(data) {
  const supabase = createClient();
  const s = data.settings;

  const { error: sErr } = await supabase
    .from("settings")
    .upsert({
      id: 1,
      email: s.email,
      phone: s.phone,
      location: s.location,
      tagline: s.tagline,
      hero_lines: s.heroLines,
      hero_sub: s.heroSub,
      statement: s.statement,
      about: s.about,
      bigmark: s.bigmark,
      ticker: s.ticker,
      marquee: s.marquee,
      instagram: s.instagram,
      youtube: s.youtube,
      updated_at: new Date().toISOString(),
    });
  if (sErr) throw sErr;

  const cats = data.categories.map((c, i) => ({
    id: c.id, name: c.name, blurb: c.blurb, tone: c.tone, image: c.image, position: i,
  }));
  if (cats.length) {
    const { error } = await supabase.from("categories").upsert(cats);
    if (error) throw error;
  }
  await deleteMissing(supabase, "categories", cats.map((c) => c.id));

  const prods = data.products.map((p, i) => ({
    id: p.id, name: p.name, cat: p.cat, price: p.price, tone: p.tone,
    blurb: p.blurb, description: p.desc, images: p.images, featured: p.featured, position: i,
  }));
  if (prods.length) {
    const { error } = await supabase.from("products").upsert(prods);
    if (error) throw error;
  }
  await deleteMissing(supabase, "products", prods.map((p) => p.id));

  const slides = data.heroSlides.map((sl, i) => ({
    id: sl.id, tone: sl.tone, label: sl.label, image: sl.image, position: i,
  }));
  if (slides.length) {
    const { error } = await supabase.from("hero_slides").upsert(slides);
    if (error) throw error;
  }
  await deleteMissing(supabase, "hero_slides", slides.map((s) => s.id));
}

export default function AdminClient({ initialData, userEmail }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState("products");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [signedIn, setSignedIn] = useState(true);
  const firstRun = useRef(true);
  const inFlight = useRef(false);
  const latest = useRef(data);
  latest.current = data;

  // Confirm we actually have a session — without it every write is blocked by
  // RLS and "saving" would fail silently.
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setSignedIn(!!session));
  }, []);

  const doSave = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setSaveError("");
    try {
      await flush(latest.current);
    } catch (e) {
      // Surface the real Postgres/RLS message and log the full error for devtools.
      console.error("[admin] save failed:", e);
      setSaveError(e?.message || "save failed");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  // Debounced live save — mirrors the prototype's autosave, but writes to Supabase.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaving(true);
    setSaveError("");
    const t = setTimeout(doSave, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const s = data.settings;

  const patchSettings = (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const patchHeroLine = (idx, val) =>
    setData((d) => {
      const hl = [...d.settings.heroLines];
      hl[idx] = val;
      return { ...d, settings: { ...d.settings, heroLines: hl } };
    });

  const patchProduct = (id, patch) =>
    setData((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const addProduct = () =>
    setData((d) => ({
      ...d,
      products: [
        { id: uid(), name: "New listing", cat: d.categories[0]?.name || "Everything", price: "$0", tone: "t2", blurb: "", desc: "", images: [], featured: false },
        ...d.products,
      ],
    }));
  const removeProduct = (id) => setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }));
  const addImage = (id) =>
    setData((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, images: [...(p.images || []), ""] } : p)) }));
  const setImage = (id, ix, url) =>
    setData((d) => ({
      ...d,
      products: d.products.map((p) => {
        if (p.id !== id) return p;
        const im = [...(p.images || [])];
        im[ix] = url;
        return { ...p, images: im };
      }),
    }));
  const removeImage = (id, ix) =>
    setData((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, images: (p.images || []).filter((_, j) => j !== ix) } : p)) }));

  const patchCat = (id, patch) => setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const renameCat = (id, name) =>
    setData((d) => {
      const old = d.categories.find((c) => c.id === id)?.name;
      return {
        ...d,
        categories: d.categories.map((c) => (c.id === id ? { ...c, name } : c)),
        products: d.products.map((p) => (p.cat === old ? { ...p, cat: name } : p)),
      };
    });
  const addCat = () =>
    setData((d) => ({ ...d, categories: [...d.categories, { id: newId(), name: "New category", blurb: "", tone: "t2", image: "" }] }));
  const removeCat = (id) => setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }));

  const patchSlide = (id, patch) => setData((d) => ({ ...d, heroSlides: d.heroSlides.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)) }));
  const addSlide = () => setData((d) => ({ ...d, heroSlides: [...d.heroSlides, { id: newId(), tone: "t2", label: "new shot", image: "" }] }));
  const removeSlide = (id) => setData((d) => ({ ...d, heroSlides: d.heroSlides.filter((sl) => sl.id !== id) }));

  const resetData = () => {
    if (!window.confirm("Reset all content back to the original defaults?")) return;
    setData({
      settings: { ...DEFAULT_DATA.settings },
      categories: DEFAULT_DATA.categories.map((c) => ({ ...c, id: newId() })),
      products: DEFAULT_DATA.products.map((p) => ({ ...p, images: [...p.images] })),
      heroSlides: DEFAULT_DATA.heroSlides.map((sl) => ({ ...sl, id: newId() })),
    });
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const saveLabel = saveError ? `save failed — ${saveError}` : saving ? "saving…" : "all changes saved";

  return (
    <section className="admin">
      <div className="admin-bar">
        <div>
          <span className="admin-eyebrow">admin{userEmail ? ` · ${userEmail}` : ""}</span>
          <h1 className="admin-title">Manage the shop</h1>
        </div>
        <div className="admin-actions">
          <span className={`admin-save ${saveError ? "err" : ""}`}>{saveLabel}</span>
          <button className="adm-ghost" onClick={doSave} disabled={saving}>save now</button>
          <button className="adm-ghost" onClick={resetData}>reset to defaults</button>
          <button className="adm-ghost" onClick={signOut}><LogOut size={14} /> sign out</button>
          <Link className="adm-primary" href="/"><ArrowLeft size={14} /> view site</Link>
        </div>
      </div>

      {!signedIn && (
        <div className="admin-warn">
          <Lock size={14} /> you're not signed in — changes can't be saved. <Link href="/admin/login">sign in</Link>.
        </div>
      )}

      <div className="admin-tabs">
        {["products", "categories", "hero", "site"].map((t) => (
          <button key={t} className={`chip ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "products" && (
        <div className="adm-section">
          <button className="adm-add-big" onClick={addProduct}><Plus size={16} /> new listing</button>
          {data.products.map((p) => (
            <div className="adm-item" key={p.id}>
              <div className="adm-item-preview"><Frame tone={p.tone} image={(p.images || [])[0]} /></div>
              <div className="adm-item-fields">
                <Field label="name" value={p.name} onChange={(v) => patchProduct(p.id, { name: v })} />
                <div className="adm-row2">
                  <label className="adm-field">
                    <span>category</span>
                    <select className="adm-select" value={p.cat} onChange={(e) => patchProduct(p.id, { cat: e.target.value })}>
                      {data.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </label>
                  <Field label="price" value={p.price} onChange={(v) => patchProduct(p.id, { price: v })} ph="$28 / from $80 / let's talk" />
                </div>
                <Field label="short blurb (shown on cards)" value={p.blurb} onChange={(v) => patchProduct(p.id, { blurb: v })} />
                <Field label="description (product page)" value={p.desc} onChange={(v) => patchProduct(p.id, { desc: v })} area />
                <ToneField value={p.tone} onChange={(v) => patchProduct(p.id, { tone: v })} />
                <div className="adm-field">
                  <span>images — first one is the cover · paste a url or upload</span>
                  {(p.images || []).map((url, ix) => (
                    <div className="adm-imgrow" key={ix}>
                      <ImageInput value={url} folder={`products/${p.id}`} onChange={(v) => setImage(p.id, ix, v)} />
                      <button className="adm-mini" onClick={() => removeImage(p.id, ix)} aria-label="remove image"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button className="adm-add" onClick={() => addImage(p.id)}><Plus size={14} /> add image</button>
                </div>
                <div className="adm-item-foot">
                  <label className="adm-check"><input type="checkbox" checked={!!p.featured} onChange={(e) => patchProduct(p.id, { featured: e.target.checked })} /> featured on home</label>
                  <button className="adm-del" onClick={() => removeProduct(p.id)}><Trash2 size={14} /> delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "categories" && (
        <div className="adm-section">
          <button className="adm-add-big" onClick={addCat}><Plus size={16} /> new category</button>
          {data.categories.map((c) => (
            <div className="adm-item" key={c.id}>
              <div className="adm-item-preview"><Frame tone={c.tone} image={c.image} /></div>
              <div className="adm-item-fields">
                <Field label="name (renaming re-tags its products)" value={c.name} onChange={(v) => renameCat(c.id, v)} />
                <Field label="blurb" value={c.blurb} onChange={(v) => patchCat(c.id, { blurb: v })} />
                <ToneField value={c.tone} onChange={(v) => patchCat(c.id, { tone: v })} />
                <div className="adm-field">
                  <span>image · paste a url or upload</span>
                  <div className="adm-imgrow">
                    <ImageInput value={c.image} folder="categories" onChange={(v) => patchCat(c.id, { image: v })} />
                  </div>
                </div>
                <div className="adm-item-foot">
                  <span />
                  <button className="adm-del" onClick={() => removeCat(c.id)}><Trash2 size={14} /> delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "hero" && (
        <div className="adm-section">
          <button className="adm-add-big" onClick={addSlide}><Plus size={16} /> new hero image</button>
          {data.heroSlides.map((sl) => (
            <div className="adm-item" key={sl.id}>
              <div className="adm-item-preview"><Frame tone={sl.tone} image={sl.image} label={sl.label} /></div>
              <div className="adm-item-fields">
                <Field label="caption" value={sl.label} onChange={(v) => patchSlide(sl.id, { label: v })} />
                <ToneField value={sl.tone} onChange={(v) => patchSlide(sl.id, { tone: v })} />
                <div className="adm-field">
                  <span>image · paste a url or upload</span>
                  <div className="adm-imgrow">
                    <ImageInput value={sl.image} folder="hero" onChange={(v) => patchSlide(sl.id, { image: v })} />
                  </div>
                </div>
                <div className="adm-item-foot">
                  <span />
                  <button className="adm-del" onClick={() => removeSlide(sl.id)}><Trash2 size={14} /> delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "site" && (
        <div className="adm-section">
          <div className="adm-grid2">
            <Field label="contact email" value={s.email} onChange={(v) => patchSettings({ email: v })} />
            <Field label="contact phone" value={s.phone} onChange={(v) => patchSettings({ phone: v })} />
            <Field label="location" value={s.location} onChange={(v) => patchSettings({ location: v })} />
            <Field label="footer tagline" value={s.tagline} onChange={(v) => patchSettings({ tagline: v })} />
            <Field label="instagram url" value={s.instagram} onChange={(v) => patchSettings({ instagram: v })} />
            <Field label="youtube url" value={s.youtube} onChange={(v) => patchSettings({ youtube: v })} />
          </div>
          <div className="adm-grid2">
            <Field label="hero word 1" value={s.heroLines[0]} onChange={(v) => patchHeroLine(0, v)} />
            <Field label="hero word 2" value={s.heroLines[1]} onChange={(v) => patchHeroLine(1, v)} />
            <Field label="hero word 3 (accent)" value={s.heroLines[2]} onChange={(v) => patchHeroLine(2, v)} />
            <Field label="giant footer word" value={s.bigmark} onChange={(v) => patchSettings({ bigmark: v })} />
          </div>
          <Field label="hero subtext" value={s.heroSub} onChange={(v) => patchSettings({ heroSub: v })} area />
          <Field label="footer statement (line breaks allowed)" value={s.statement} onChange={(v) => patchSettings({ statement: v })} area />
          <Field label="about line" value={s.about} onChange={(v) => patchSettings({ about: v })} area />
          <Field label="ticker text (separate with · )" value={s.ticker} onChange={(v) => patchSettings({ ticker: v })} area />
          <Field label="marquee text (separate with · )" value={s.marquee} onChange={(v) => patchSettings({ marquee: v })} area />
        </div>
      )}
    </section>
  );
}
