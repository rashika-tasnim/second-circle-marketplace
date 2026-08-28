create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  price integer not null check (price >= 0),
  category text not null,
  condition text not null,
  place text not null,
  description text not null check (char_length(description) <= 800),
  image_url text not null,
  seller_name text not null,
  status text not null default 'active' check (status in ('active', 'reserved', 'sold')),
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

drop policy if exists "Listings are visible to everyone" on public.listings;
create policy "Listings are visible to everyone"
on public.listings for select using (true);

drop policy if exists "Members can create their own listings" on public.listings;
create policy "Members can create their own listings"
on public.listings for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Members can update their own listings" on public.listings;
create policy "Members can update their own listings"
on public.listings for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Members can delete their own listings" on public.listings;
create policy "Members can delete their own listings"
on public.listings for delete to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Listing images are publicly readable" on storage.objects;
create policy "Listing images are publicly readable"
on storage.objects for select using (bucket_id = 'listing-images');

drop policy if exists "Members can upload listing images" on storage.objects;
create policy "Members can upload listing images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Members can delete their listing images" on storage.objects;
create policy "Members can delete their listing images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_created_at_idx on public.listings(created_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null,
  body text not null check (char_length(body) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

alter table public.messages enable row level security;

drop policy if exists "Participants can read their messages" on public.messages;
create policy "Participants can read their messages"
on public.messages for select to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Participants can send listing messages" on public.messages;
create policy "Participants can send listing messages"
on public.messages for insert to authenticated
with check (
  auth.uid() = sender_id
  and sender_id <> recipient_id
  and exists (
    select 1 from public.listings
    where listings.id = listing_id
      and (listings.user_id = sender_id or listings.user_id = recipient_id)
  )
);

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
on public.messages for update to authenticated
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

create index if not exists messages_listing_id_idx on public.messages(listing_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_recipient_id_idx on public.messages(recipient_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

alter table public.listings add column if not exists demo_key text;
create unique index if not exists listings_demo_key_uidx on public.listings(demo_key);

create table if not exists public.saved_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.saved_items enable row level security;
drop policy if exists "Members can read saved items" on public.saved_items;
create policy "Members can read saved items" on public.saved_items for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Members can save items" on public.saved_items;
create policy "Members can save items" on public.saved_items for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Members can remove saved items" on public.saved_items;
create policy "Members can remove saved items" on public.saved_items for delete to authenticated using (auth.uid() = user_id);

insert into public.listings (user_id,title,price,category,condition,place,description,image_url,seller_name,status,demo_key)
select u.id,s.title,s.price,s.category,s.condition,s.place,s.description,s.image_url,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1), 'Second Circle member'),
  'active',s.demo_key
from auth.users u cross join (values
('oak-chair','Oak reading chair',650,'Furniture','Good','Bergen','A comfortable solid-oak reading chair with a warm natural finish. Light signs of use, but sturdy and clean.','https://images.unsplash.com/photo-1650476524564-f94dc9669067?auto=format&fit=crop&w=1400&q=86'),
('denim-jacket','Classic denim jacket',320,'Clothing','Very good','Oslo','Classic mid-blue denim jacket, freshly washed, with no stains or damaged fastenings.','https://images.unsplash.com/photo-1485811661309-ab85183a729c?auto=format&fit=crop&w=1400&q=86'),
('city-bike','City bicycle',1900,'Sport','Good','Bergen','Reliable city bicycle with seven gears, working lights and a rear carrier. Recently serviced.','https://images.unsplash.com/photo-1529422643029-d4585747aaf2?auto=format&fit=crop&w=1400&q=86'),
('film-camera','Film camera',850,'Electronics','Used','Stavanger','A characterful 35 mm film camera with a manual lens and original strap.','https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=86'),
('table-lamp','Ceramic table lamp',280,'Home','Very good','Bergen','Small ceramic table lamp with a linen shade and warm ambient light. Fully working.','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=86'),
('side-table','Walnut side table',500,'Furniture','Good','Oslo','Compact walnut side table with a simple silhouette and useful lower shelf.','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=86'),
('headphones','Noise-cancelling headphones',720,'Electronics','Very good','Trondheim','Comfortable over-ear headphones with active noise cancellation, case and charging cable.','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=86'),
('leather-jacket','Vintage leather jacket',780,'Clothing','Good','Bergen','Soft vintage leather jacket with a clean lining and minor wear around the cuffs.','https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=86'),
('fiction-bundle','Modern fiction bundle',240,'Books','Very good','Oslo','A bundle of six contemporary novels in English, clean with light shelf wear.','https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=86'),
('espresso-maker','Compact espresso maker',950,'Home','Good','Stavanger','Compact countertop espresso maker, regularly descaled and supplied with accessories.','https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1400&q=86'),
('running-shoes','Everyday running shoes',430,'Sport','Good','Trondheim','Lightweight running shoes, EU size 39, clean with plenty of cushioning remaining.','https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=86'),
('pine-bookshelf','Slim pine bookshelf',600,'Furniture','Used','Bergen','A narrow solid-pine bookshelf suited to a hallway or small room. Stable with visible marks.','https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1400&q=86')
) as s(demo_key,title,price,category,condition,place,description,image_url)
where u.id = (select id from auth.users order by created_at asc limit 1)
on conflict (demo_key) do update set user_id=excluded.user_id,seller_name=excluded.seller_name,status='active';
