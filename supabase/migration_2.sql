-- MeetPol migration 2: photos, categories/items, storage, new settings. Run once in Supabase SQL Editor.
alter table public.applicants add column if not exists photo_url text;
alter table public.applicants add column if not exists photo_style jsonb default '{}'::jsonb;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique,
  kind text not null default 'generic' check (kind in ('generic','templates')),
  description text, icon text default '📁', sort_order int default 0,
  created_at timestamptz not null default now());
create table if not exists public.category_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  title text not null, description text, link_url text, image_url text,
  created_at timestamptz not null default now());

alter table public.categories enable row level security;
alter table public.category_items enable row level security;
create policy "categories read" on categories for select using (true);
create policy "categories admin write" on categories for all using (is_admin()) with check (is_admin());
create policy "items read" on category_items for select using (true);
create policy "items admin write" on category_items for all using (is_admin()) with check (is_admin());

insert into public.categories(name,slug,kind,icon,description,sort_order) values
 ('Donations','donations','generic','💝','Support causes and people.',1),
 ('Fund','fund','generic','💰','Funding opportunities.',2),
 ('Templates','templates','templates','🧩','Website templates with live preview.',3)
on conflict do nothing;

insert into public.site_settings(key,value) values ('site_name','MeetPol') on conflict do nothing;

-- Photo storage (public bucket; each user may only write inside their own folder)
insert into storage.buckets (id,name,public) values ('avatars','avatars',true) on conflict do nothing;
create policy "avatars public read" on storage.objects for select using (bucket_id='avatars');
create policy "avatars own insert" on storage.objects for insert to authenticated
  with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatars own update" on storage.objects for update to authenticated
  using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatars own delete" on storage.objects for delete to authenticated
  using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatars admin all" on storage.objects for all to authenticated
  using (bucket_id='avatars' and is_admin()) with check (bucket_id='avatars' and is_admin());
