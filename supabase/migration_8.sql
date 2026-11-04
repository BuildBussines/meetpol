-- MeetPol migration 8: job applications, employer save/interest, notifications. Safe to re-run.
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  posting_id uuid not null references public.postings(id) on delete cascade,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'applied' check (status in ('applied','shortlisted','rejected')),
  created_at timestamptz not null default now(),
  unique (posting_id, applicant_user_id));

create table if not exists public.employer_actions (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references auth.users(id) on delete cascade,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('saved','interested')),
  created_at timestamptz not null default now(),
  unique (employer_id, applicant_user_id, kind));

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text, text text not null, link text,
  read boolean not null default false,
  created_at timestamptz not null default now());

-- how many employers showed interest (employers' private "saved" list is never counted or exposed)
create or replace view public.applicant_interest as
  select applicant_user_id, count(*) filter (where kind='interested') as interested from public.employer_actions group by applicant_user_id;
grant select on public.applicant_interest to authenticated;

alter table public.applications enable row level security;
alter table public.employer_actions enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "apps applicant read" on public.applications;
drop policy if exists "apps employer read" on public.applications;
drop policy if exists "apps insert" on public.applications;
drop policy if exists "apps employer update" on public.applications;
drop policy if exists "apps applicant delete" on public.applications;
drop policy if exists "apps admin all" on public.applications;
create policy "apps applicant read" on public.applications for select using (applicant_user_id=auth.uid());
create policy "apps employer read" on public.applications for select using (exists (select 1 from public.postings p where p.id=posting_id and p.employer_id=auth.uid()));
create policy "apps insert" on public.applications for insert with check (applicant_user_id=auth.uid() and status='applied'
  and exists (select 1 from public.applicants a where a.user_id=auth.uid()));
create policy "apps employer update" on public.applications for update
  using (exists (select 1 from public.postings p where p.id=posting_id and p.employer_id=auth.uid()))
  with check (exists (select 1 from public.postings p where p.id=posting_id and p.employer_id=auth.uid()));
create policy "apps applicant delete" on public.applications for delete using (applicant_user_id=auth.uid());
create policy "apps admin all" on public.applications for all using (is_admin()) with check (is_admin());

-- employers may only change the status of an application, nothing else
create or replace function public.guard_application() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not is_admin() then
    new.posting_id:=old.posting_id; new.applicant_user_id:=old.applicant_user_id; new.message:=old.message; new.created_at:=old.created_at;
  end if; return new; end $$;
drop trigger if exists guard_application on public.applications;
create trigger guard_application before update on public.applications for each row execute function public.guard_application();

drop policy if exists "actions employer all" on public.employer_actions;
drop policy if exists "actions admin all" on public.employer_actions;
create policy "actions employer all" on public.employer_actions for all
  using (employer_id=auth.uid() and is_employer()) with check (employer_id=auth.uid() and is_employer());
create policy "actions admin all" on public.employer_actions for all using (is_admin()) with check (is_admin());

drop policy if exists "notes own read" on public.notifications;
drop policy if exists "notes own update" on public.notifications;
drop policy if exists "notes own delete" on public.notifications;
drop policy if exists "notes admin all" on public.notifications;
create policy "notes own read" on public.notifications for select using (user_id=auth.uid());
create policy "notes own update" on public.notifications for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "notes own delete" on public.notifications for delete using (user_id=auth.uid());
create policy "notes admin all" on public.notifications for all using (is_admin()) with check (is_admin());
-- no insert policy for users: notifications are created only by the trigger functions below

create or replace function public.push_notification(uid uuid, t text, msg text, lnk text) returns void
language sql security definer set search_path=public as $$
  insert into notifications(user_id,type,text,link) select uid,t,msg,lnk where uid is not null $$;

create or replace function public.trg_app_insert() returns trigger language plpgsql security definer set search_path=public as $$
declare pt text; own uuid; nm text;
begin
  select title, employer_id into pt, own from postings where id=new.posting_id;
  select name into nm from applicants where user_id=new.applicant_user_id;
  perform push_notification(own,'application', coalesce(nm,'Someone')||' applied to '||coalesce(pt,'your posting'), '/applications');
  return new; end $$;
drop trigger if exists app_insert on public.applications;
create trigger app_insert after insert on public.applications for each row execute function public.trg_app_insert();

create or replace function public.trg_app_status() returns trigger language plpgsql security definer set search_path=public as $$
declare pt text;
begin
  if new.status is distinct from old.status and new.status in ('shortlisted','rejected') then
    select title into pt from postings where id=new.posting_id;
    perform push_notification(new.applicant_user_id,'application',
      case when new.status='shortlisted' then '🎉 You were shortlisted for ' else 'Update on your application for ' end || coalesce(pt,'a job'), '/my-applications');
  end if; return new; end $$;
drop trigger if exists app_status on public.applications;
create trigger app_status after update on public.applications for each row execute function public.trg_app_status();

create or replace function public.trg_interest() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.kind='interested' then perform push_notification(new.applicant_user_id,'interest','👀 An employer is interested in your profile','/my-applications'); end if;
  return new; end $$;
drop trigger if exists interest_ins on public.employer_actions;
create trigger interest_ins after insert on public.employer_actions for each row execute function public.trg_interest();

-- donations: notify the requester about pledges, the supporter about confirmations, the requester about approval
create or replace function public.trg_pledge() returns trigger language plpgsql security definer set search_path=public as $$
declare own uuid; rt text;
begin
  if tg_op='INSERT' then
    select user_id, coalesce(reason,title) into own, rt from donation_requests where id=new.request_id;
    perform push_notification(own,'donation', coalesce(new.funder_name,'Someone')||' pledged '||new.amount||' to "'||coalesce(rt,'your request')||'"', '/c/donations');
  elsif new.status is distinct from old.status and new.status in ('confirmed','rejected') then
    select coalesce(reason,title) into rt from donation_requests where id=new.request_id;
    perform push_notification(new.funder_id,'donation', case when new.status='confirmed' then '✅ Your pledge was confirmed for ' else 'Your pledge was marked not received for ' end || coalesce(rt,'a request'), '/c/fund');
  end if; return new; end $$;
drop trigger if exists pledge_change on public.fundings;
create trigger pledge_change after insert or update on public.fundings for each row execute function public.trg_pledge();

create or replace function public.trg_request_status() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status is distinct from old.status and new.status in ('approved','rejected') then
    perform push_notification(new.user_id,'donation', case when new.status='approved' then '✅ Your donation request is now live: ' else 'Your donation request was not approved: ' end || coalesce(new.reason,new.title,''), '/c/donations');
  end if; return new; end $$;
drop trigger if exists request_status on public.donation_requests;
create trigger request_status after update on public.donation_requests for each row execute function public.trg_request_status();
