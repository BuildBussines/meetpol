-- MeetPol migration 6 (all-in-one, safe to re-run): tester role in the list, coming soon for categories AND items.
alter table public.profiles add column if not exists is_tester boolean not null default false;
alter table public.categories add column if not exists coming_soon boolean not null default false;
alter table public.category_items add column if not exists coming_soon boolean not null default false;

-- "tester" becomes a normal choice in the role list
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('seeker','employer','tester','admin'));
update public.profiles set role='tester' where is_tester and role in ('seeker','employer');

create or replace function public.is_tester() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and (role='tester' or is_tester)) $$;

create or replace function public.guard_profile() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not is_admin() then new.is_tester := old.is_tester; end if;
  return new;
end $$;
drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles for each row execute function public.guard_profile();

-- Users can only pick seeker/employer for themselves (existing policy), so only an admin can grant "tester".
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (not coming_soon or is_admin() or is_tester());
drop policy if exists "items read" on public.category_items;
create policy "items read" on public.category_items for select using (
  (not coming_soon or is_admin() or is_tester())
  and exists (select 1 from public.categories c where c.id=category_id and (not c.coming_soon or is_admin() or is_tester())));
