-- MeetPol migration 7 (all-in-one, safe to re-run): coming-soon poster per category + tester role.
alter table public.profiles add column if not exists is_tester boolean not null default false;
alter table public.categories add column if not exists coming_soon boolean not null default false;
alter table public.categories add column if not exists poster_title text;
alter table public.categories add column if not exists poster_text text;
alter table public.categories add column if not exists poster_image text;
alter table public.category_items add column if not exists coming_soon boolean not null default false;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('seeker','employer','tester','admin'));

create or replace function public.is_tester() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and (role='tester' or is_tester)) $$;

-- The category itself stays visible to everyone (visitors see the poster)...
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (true);
-- ...but its content is only readable by admin/testers while coming soon is ON
drop policy if exists "items read" on public.category_items;
create policy "items read" on public.category_items for select using (
  exists (select 1 from public.categories c where c.id=category_id and (not c.coming_soon or is_admin() or is_tester())));
