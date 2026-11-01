-- MeetPol migration 3: donation requests + funding. Run once in Supabase SQL Editor (after migration 2).
alter table public.categories drop constraint if exists categories_kind_check;
alter table public.categories add constraint categories_kind_check check (kind in ('generic','templates','donations','fund'));
update public.categories set kind='donations' where slug='donations';
update public.categories set kind='fund' where slug='fund';

create table public.donation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, story text,
  goal_amount numeric not null check (goal_amount > 0),
  currency text not null default 'USD',
  payment_info text,           -- how supporters should send money (bank / JazzCash / PayPal link ...)
  contact text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','closed')),
  created_at timestamptz not null default now());

create table public.fundings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.donation_requests(id) on delete cascade,
  funder_id uuid not null references auth.users(id) on delete cascade,
  funder_name text, amount numeric not null check (amount > 0),
  reference text, message text,
  status text not null default 'pledged' check (status in ('pledged','confirmed','rejected')),
  created_at timestamptz not null default now());

-- Public progress numbers (view runs with owner rights, so it can total all rows safely)
create view public.request_totals as
  select request_id, coalesce(sum(amount) filter (where status='confirmed'),0) as total,
         count(*) filter (where status='confirmed') as backers
  from public.fundings group by request_id;
grant select on public.request_totals to anon, authenticated;

alter table public.donation_requests enable row level security;
alter table public.fundings enable row level security;

create policy "requests public read" on donation_requests for select using (status in ('approved','closed'));
create policy "requests owner read" on donation_requests for select using (user_id=auth.uid());
create policy "requests owner insert" on donation_requests for insert with check (user_id=auth.uid() and status='pending');
create policy "requests owner update" on donation_requests for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "requests owner delete" on donation_requests for delete using (user_id=auth.uid() and status in ('pending','rejected'));
create policy "requests admin all" on donation_requests for all using (is_admin()) with check (is_admin());

-- Owners can't approve themselves: only admin changes status (owner may only close an approved request).
-- Editing an approved/rejected request sends it back to "pending" for re-review.
create function public.guard_request() returns trigger language plpgsql as $$
begin
  if is_admin() then return new; end if;
  new.user_id := old.user_id;
  if new.status='closed' and old.status in ('approved','closed') then return new; end if;
  if old.status in ('approved','rejected') and (new.title is distinct from old.title or new.story is distinct from old.story
     or new.payment_info is distinct from old.payment_info or new.goal_amount is distinct from old.goal_amount) then
    new.status := 'pending';
  else new.status := old.status; end if;
  return new;
end $$;
create trigger guard_request before update on donation_requests for each row execute function guard_request();

create policy "fundings funder read" on fundings for select using (funder_id=auth.uid());
create policy "fundings owner read" on fundings for select using (exists (select 1 from donation_requests r where r.id=request_id and r.user_id=auth.uid()));
create policy "fundings insert" on fundings for insert with check (funder_id=auth.uid() and status='pledged'
  and exists (select 1 from donation_requests r where r.id=request_id and r.status='approved' and r.user_id<>auth.uid()));
create policy "fundings owner update" on fundings for update
  using (exists (select 1 from donation_requests r where r.id=request_id and r.user_id=auth.uid()))
  with check (exists (select 1 from donation_requests r where r.id=request_id and r.user_id=auth.uid()));
create policy "fundings funder delete" on fundings for delete using (funder_id=auth.uid() and status='pledged');
create policy "fundings admin all" on fundings for all using (is_admin()) with check (is_admin());

-- Request owners may only change a pledge's status (confirm/reject), nothing else.
create function public.guard_funding() returns trigger language plpgsql as $$
begin
  if is_admin() then return new; end if;
  new.request_id:=old.request_id; new.funder_id:=old.funder_id; new.funder_name:=old.funder_name; new.amount:=old.amount;
  new.reference:=old.reference; new.message:=old.message; new.created_at:=old.created_at;
  return new;
end $$;
create trigger guard_funding before update on fundings for each row execute function guard_funding();
