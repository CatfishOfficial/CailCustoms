# Cail Customs — Build Handoff

This is a spec for turning the working prototype (`CailCustoms.jsx`) into a production app. Read this whole file before writing code.

## What this is

A showcase storefront for Cail Customs (a small maker studio in Lubbock, TX). It is **contact-to-buy** — there is no cart or checkout. Customers browse products; every "buy" action opens a pre-filled email/phone inquiry. There is also an **admin page** for the team to manage all content.

`CailCustoms.jsx` is a single, self-contained React component that contains the entire finished design: layout, styling, copy, motion, and a working admin UI. It runs today, but persists to `localStorage`, has no auth, and has no real routing. Your job is to keep the design exactly as-is and replace the plumbing underneath it.

## Guardrails — do NOT redesign

The look and feel are approved and final. Preserve them exactly:

- All visual design, palette (bone `#F2EEE4`, ink `#181713`, accent blue `#2540E6`), fonts (Anton / Space Grotesk / Space Mono), and the embedded `[CC]` logo.
- All interactions: the modular view-swapping (home → category → product → admin), the hero image card-deck slideshow, the two scrolling banners (ticker + marquee), the junk-drawer icon pop on category hover, the giant cut-off `CAILCUSTOMS` footer wordmark, hover states, and scroll reveals.
- All copy and the casual lowercase voice.
- `prefers-reduced-motion` handling and keyboard focus styles.

Lift the JSX/CSS out of the single file into a sensible component structure, but the rendered result should look and behave identically. If a change seems necessary, flag it rather than doing it silently.

## Target stack

- **Next.js (App Router)** — the team is on GitHub + Vercel; this is the clean fit and gives real URLs/SSR.
- **Supabase** — Postgres for content, Supabase Auth for the admin, Supabase Storage for images. (The team already uses Supabase.) An existing Cloudflare R2 bucket is also available if preferred for image storage.
- **Vercel** for deploy.

## The four build tasks

### 1. Move content into Supabase (replaces localStorage)

All editable content currently lives in one `data` object with this shape (see `DEFAULT_DATA` in the prototype):

```
settings: {
  email, phone, location, tagline,
  heroLines: [string, string, string],   // the big MAKE / COOL / STUFF. headline
  heroSub, statement, about, bigmark,     // statement may contain "\n"
  ticker, marquee,                        // "·"-separated phrases
  instagram, youtube
}
categories: [ { name, blurb, tone, image } ]
products:   [ { id, name, cat, price, tone, blurb, desc, images: [url], featured } ]
heroSlides: [ { tone, label, image } ]
```

Notes:
- `tone` is one of `t1`–`t6` — a placeholder gradient shown when there is no image. Keep it; it's the graceful fallback.
- `image` / `images` are URLs today. `products.images` is an array; `images[0]` is the cover.
- `price` is free text (`"$28"`, `"from $150"`, `"let's talk"`). The UI infers "made to order" when it starts with "from"/"let".
- `product.cat` references `category.name`. Renaming a category must re-tag its products (the prototype's admin already does this — preserve that behavior).

Recommended: one row of site content, or normalized tables (`settings`, `categories`, `products`, `hero_slides`) — your call, but the front end just needs the same shape assembled. Replace the `store` adapter (currently `window.storage` / `localStorage`) with Supabase reads/writes. The storefront should read published content; the admin writes it. Consider a draft/publish split later, but v1 can edit live.

### 2. Auth on the admin

The admin is currently reachable via a footer "admin" link with a warning banner and **no protection** — anyone can edit or delete the catalog. Gate the admin route behind **Supabase Auth** (email invite / magic link is fine for a small team). Unauthenticated users hitting the admin route get redirected to login. Remove the warning banner once real auth is in place.

### 3. Real image uploads

Replace the admin's "paste image URL" fields with **file uploads** to Supabase Storage (or R2). Products need multiple images; categories and hero slides need one each. Store the resulting public URL in the same `image`/`images` fields so nothing downstream changes. Keep the URL-paste option as a fallback if easy.

### 4. Real routes

Right now everything is one in-memory view swap, so back/refresh/shareable links don't work. Create real routes:

- `/` — home
- `/shop/[category]` — category page (slug of category name)
- `/product/[id]` — product detail (shareable; good for sharing a listing)
- `/admin` — protected admin

Preserve the animated module-swap feel between storefront pages where reasonable, but URLs must be real and shareable, and the product pages should be server-rendered for link previews/SEO.

## Env / setup the team will need

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase service role key (server-side only) for admin writes if using RLS + server actions
- Storage bucket (public read) for images
- Seed the DB with `DEFAULT_DATA` from the prototype so the site isn't empty on first run

## Definition of done

- Storefront looks and behaves identically to `CailCustoms.jsx`.
- Content is served from Supabase; an admin edit is visible to everyone, not just one browser.
- `/admin` requires login; logged-out users can't reach it.
- Images can be uploaded (not just URL-pasted) and render on cards, category tiles, hero slides, and product pages.
- Home, category, and product pages have real, shareable URLs; back button and refresh work.
- Deploys to Vercel from the GitHub repo.
- `prefers-reduced-motion` and keyboard focus still respected.

## Out of scope for v1 (note, don't build)

- Cart / checkout / payments — this is intentionally contact-to-buy.
- Order management, inventory counts, customer accounts.
- A draft/preview system (nice later, not required now).

## Contact details baked into the design

- Email: `cailandco@gmail.com`
- Phone: `(806) 601-7587`
- Location: Lubbock, TX

(These live in `settings` and should become editable via the admin, as they already are in the prototype.)
