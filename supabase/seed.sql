-- Cail Customs — seed data (DEFAULT_DATA from the prototype)
-- Run after schema.sql. Safe to run once on a fresh DB.
-- Each block only inserts when its table is empty, so re-running won't duplicate.

-- ---------------------------------------------------------------------------
-- SETTINGS
-- ---------------------------------------------------------------------------
insert into public.settings (
  id, email, phone, location, tagline, hero_lines, hero_sub, statement,
  about, bigmark, ticker, marquee, instagram, youtube
) values (
  1,
  'cailandco@gmail.com',
  '(806) 601-7587',
  'Lubbock, TX',
  'make cool stuff.',
  '["MAKE","COOL","STUFF."]'::jsonb,
  'a small crew making a lot of different things — shirts, builds, sound, design. pick a lane below and have a look around.',
  E'Designed by you,\nmade by Cail&Co.',
  'a small team, a bunch of mediums, and a soft spot for making things that didn''t exist yesterday.',
  'CAILCUSTOMS',
  'STUDIO OPEN · NEW DROP FRIDAY · MADE IN LUBBOCK, TX · SMALL BATCH, HANDMADE · SHIPPING NOW ·',
  'THREAD · PIXELS · CIRCUITS · SOUND · LIGHT · MAKE COOL STUFF ·',
  'https://www.instagram.com/',
  'https://www.youtube.com/'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- CATEGORIES (only if empty)
-- ---------------------------------------------------------------------------
insert into public.categories (name, blurb, tone, image, position)
select * from (values
  ('Shirts & Merch', 'wear the brand. small runs, big fits.',            't1', '', 0),
  ('Digital Design', 'logos, layouts, album art — you name it.',          't2', '', 1),
  ('Mat. Stuff',     'physical builds and objects that actually exist.',   't3', '', 2),
  ('Everything',     'the catch-all. weird one-offs live here.',           't4', '', 3),
  ('Music & Sound',  'tapes, loops, and noise worth keeping.',             't5', '', 4),
  ('Photo & Video',  'shoots, shorts, and little experiments.',            't6', '', 5)
) as v(name, blurb, tone, image, position)
where not exists (select 1 from public.categories);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
insert into public.products (id, name, cat, price, tone, blurb, description, images, featured, position)
values
  ('static-tee',  'Static Tee — White',   'Shirts & Merch', '$28',      't1', 'screen-pulled, small run',   'our house blank, pulled by hand a few dozen at a time. soft, boxy, wears in nice.', '[]'::jsonb, true,  0),
  ('hoodie',      'Cail&Co. Hoodie',      'Shirts & Merch', '$52',      't1', 'heavyweight, boxy fit',      'heavyweight fleece with a relaxed cut — the one you''ll reach for first.',          '[]'::jsonb, false, 1),
  ('patch',       'Signal Patch',         'Shirts & Merch', '$8',       't6', 'woven, iron-on',             'a little woven badge that irons or sews onto just about anything.',                 '[]'::jsonb, false, 2),
  ('stickers',    'Sticker Pack',         'Shirts & Merch', '$6',       't4', 'die-cut, 5-pack',            'five die-cut designs, weatherproof — good on laptops, bottles, whatever.',          '[]'::jsonb, false, 3),
  ('logo',        'Logo Package',         'Digital Design', 'from $150', 't2', 'full mark + all the files',  'a full identity: primary mark, alt lockups, and every file you''ll need.',          '[]'::jsonb, true,  4),
  ('album-art',   'Album Art',            'Digital Design', 'from $80',  't2', 'cover + tracklist layout',   'cover, back, and tracklist layout built to your sound.',                            '[]'::jsonb, false, 5),
  ('invislamp',   'Invislamp',            'Mat. Stuff',     '$65',      't3', 'edge-lit acrylic, hidden driver', 'edge-lit acrylic with the driver tucked out of sight, so it looks like light floating.', '[]'::jsonb, true, 6),
  ('papiershelf', 'Papiershelf',          'Mat. Stuff',     '$40',      't3', 'folded-form paper composite','a folded-form shelf that''s lighter than it looks and tougher than it should be.',  '[]'::jsonb, false, 7),
  ('cassette',    'Loop Cassette Vol.1',  'Music & Sound',  '$12',      't5', 'limited tape run',           'a short run of tapes dubbed one at a time. analog hiss included, on purpose.',      '[]'::jsonb, true,  8),
  ('shoot',       'Product Shoot',        'Photo & Video',  'from $120', 't6', 'half-day, edited, delivered','a half-day shoot for your product or drop — lit, shot, and edited.',                '[]'::jsonb, false, 9),
  ('mystery',     'Mystery Box',          'Everything',     '$25',      't4', 'you get what you get',       'a box of odds and ends we picked out. no returns, all surprises.',                  '[]'::jsonb, false, 10),
  ('custom',      'Custom Build',         'Everything',     'let''s talk', 't3', 'got an idea? bring it.',   'you''ve got an idea, we''ve got tools. tell us what you''re picturing.',            '[]'::jsonb, false, 11)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- HERO SLIDES (only if empty)
-- ---------------------------------------------------------------------------
insert into public.hero_slides (tone, label, image, position)
select * from (values
  ('t2', 'fig. 01 — the bench',   '', 0),
  ('t1', 'fig. 02 — fresh tees',  '', 1),
  ('t3', 'fig. 03 — the lamp',    '', 2),
  ('t5', 'fig. 04 — new shelf',   '', 3),
  ('t6', 'fig. 05 — on set',      '', 4),
  ('t4', 'fig. 06 — odds & ends', '', 5)
) as v(tone, label, image, position)
where not exists (select 1 from public.hero_slides);
