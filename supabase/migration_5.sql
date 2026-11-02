-- MeetPol migration 5: tester rank + coming-soon categories. Safe to run more than once.
alter table public.profiles add column if not exists is_tester boolean not null default false;
alter table public.categories add column if not exists coming_soon boolean not null default false;

create or replace function public.is_tester() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and is_tester) $$;

-- Only an admin can give or remove the tester rank (SQL Editor edits, where auth.uid() is null, are allowed too)
create or replace function public.guard_profile() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not is_admin() then new.is_tester := old.is_tester; end if;
  return new;
end $$;
drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles for each row execute function public.guard_profile();

-- Coming-soon categories (and their items) are visible only to admins and testers
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (not coming_soon or is_admin() or is_tester());
drop policy if exists "items read" on public.category_items;
create policy "items read" on public.category_items for select using (
  exists (select 1 from public.categories c where c.id=category_id and (not c.coming_soon or is_admin() or is_tester())));
