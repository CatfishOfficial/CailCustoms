# Cail Customs

Contact-to-buy showcase storefront for Cail Customs (Lubbock, TX) with a
team admin. Built from the approved `CailCustoms.jsx` prototype — the design,
copy, motion, and logo are preserved exactly; only the plumbing underneath
changed.

- **Next.js (App Router)** — real, shareable URLs + SSR for link previews.
- **Supabase** — Postgres content, Auth for the admin, Storage for images.
- **Vercel** — deploy target.

There is **no cart or checkout** — every "buy" opens a pre-filled email/phone
inquiry. That's intentional.

## Routes

| URL | What |
| --- | --- |
| `/` | home |
| `/shop/[category]` | category page (slug of the category name, e.g. `shirts-merch`) |
| `/shop/all` | everything / all products |
| `/product/[id]` | product detail (server-rendered, shareable) |
| `/admin` | protected admin (login required) |
| `/admin/login` | email + password sign in |

## Local setup

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase keys
npm run dev                         # http://localhost:3000
```

Without Supabase configured the storefront still renders using the built-in
`DEFAULT_DATA`, so you can develop the front end before the DB exists.

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **`supabase/schema.sql`** then **`supabase/seed.sql`**.
   - `schema.sql` creates the tables, row-level security (public read /
     authenticated write), and the public **`media`** storage bucket.
   - `seed.sql` loads the prototype's default content so the site isn't empty.
3. **Project Settings → API**: copy the Project URL and the `anon` public key
   into `.env.local` (see `.env.local.example`).
4. **Auth → Providers → Email**: keep Email on and turn **off** "Allow new
   users to sign up" — there's no public sign up; the admin is invite-only.
5. **Auth → Users → Add user**: create an account for each teammate with an
   email + password (check "Auto Confirm User"). They sign in at `/admin/login`
   with those credentials. To reset a password, edit the user in Supabase.

> Admin login is plain email + password handled entirely client-side, so there
> are **no** magic-link emails, no `Site URL` / redirect-allow-list config, and
> no `/auth/callback` to worry about.

### Environment variables

| Var | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API | public |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | — | defaults to `media` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API | **server-only, optional.** Not needed by the app as shipped (writes go through RLS + the logged-in session). |
| `NEXT_PUBLIC_SITE_URL` | — | optional; used for absolute URLs in metadata (set to your Vercel URL) |

## How content flows

- The storefront reads **published** content from Supabase via `lib/site.js`
  (`getSiteData`), assembled into the exact shape the prototype used:
  `{ settings, categories, products, heroSlides }`.
- The admin (`/admin`) edits that content live. Changes autosave (debounced) to
  Supabase, so an edit is visible to **everyone**, not just one browser.
- Images: paste a URL **or** upload a file. Uploads go to the `media` Storage
  bucket and the resulting public URL is stored in the same `image`/`images`
  fields — nothing downstream changes.
- Renaming a category re-tags its products automatically (preserved from the
  prototype).

`tone` values `t1`–`t6` are placeholder gradients shown when an item has no
image — the graceful fallback. `price` is free text; the UI infers "made to
order" when it starts with "from" or "let".

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the environment variables above in the Vercel project settings.
4. Deploy.

## Project map

```
app/
  layout.jsx            persistent shell (nav / ticker / footer) + fetches site data
  page.jsx              home
  shop/[category]/      category + /shop/all
  product/[id]/         product detail (SSR + OG metadata)
  admin/                protected admin
  admin/login/          email + password sign in
  globals.css           the prototype's full stylesheet (verbatim) + login/upload additions
components/             Frame, HeroSlides, Marquee, ProductCard, views, shell, admin/*
lib/
  data.js               constants, helpers, slugify, DEFAULT_DATA (client-safe)
  site.js               getSiteData() — server read/assemble
  supabase/             browser + server clients
middleware.js           refreshes the auth session; guards /admin
supabase/               schema.sql + seed.sql
public/                 logo-mark.png, logo-full.png (decoded from the prototype)
```

## What was intentionally left for later (out of scope for v1)

Cart / checkout / payments, order management, inventory, customer accounts, and
a draft/preview system. This is a contact-to-buy showcase by design.
