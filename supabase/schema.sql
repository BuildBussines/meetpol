-- MeetPol schema + RLS. Run once in Supabase > SQL Editor.
-- profiles 1:1 auth.users | applicants 1:1 auth.users | postings N:1 auth.users | site_settings key/value
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text,
  role text not null default 'seeker' check (role in ('seeker','employer','admin')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now());
create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null, age int check (age between 14 and 100),
  degree text, graduation_year int, email text, phone text,
  instagram text, facebook text, snapchat text,
  intro text, why_job text, achievements text, dream_career text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.postings (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references auth.users(id) on delete cascade,
  title text not null, company text, location text, looking_for text,
  created_at timestamptz not null default now());
create table public.site_settings (key text primary key, value text not null default '');
insert into public.site_settings(key,value) values
 ('hero_title','Where talent meets opportunity'),
 ('hero_subtitle','MeetPol connects ambitious job seekers with employers who are looking for them.'),
 ('announcement',''),('footer_text','© MeetPol') on conflict do nothing;

-- security definer helpers avoid recursive RLS on profiles
create function public.is_admin() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
create function public.is_employer() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and role in ('employer','admin')) $$;

-- auto-create a profile row on first Google sign-in
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public
as $$ begin
  insert into profiles(id,email,full_name) values (new.id,new.email,new.raw_user_meta_data->>'full_name');
  return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table applicants enable row level security;
alter table postings enable row level security;
alter table site_settings enable row level security;

-- profiles: own row (cannot self-promote to admin); admin full
create policy "profiles read own or admin" on profiles for select using (id=auth.uid() or is_admin());
create policy "profiles update own" on profiles for update using (id=auth.uid()) with check (id=auth.uid() and role in ('seeker','employer'));
create policy "profiles admin all" on profiles for all using (is_admin()) with check (is_admin());
-- applicants: owner manages own row; employers/admin read; admin full
create policy "applicants owner select" on applicants for select using (user_id=auth.uid());
create policy "applicants employer select" on applicants for select using (is_employer());
create policy "applicants owner insert" on applicants for insert with check (user_id=auth.uid());
create policy "applicants owner update" on applicants for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "applicants owner delete" on applicants for delete using (user_id=auth.uid());
create policy "applicants admin all" on applicants for all using (is_admin()) with check (is_admin());
-- postings: public read; employers manage own; admin full
create policy "postings public read" on postings for select using (true);
create policy "postings employer insert" on postings for insert with check (employer_id=auth.uid() and is_employer());
create policy "postings owner update" on postings for update using (employer_id=auth.uid()) with check (employer_id=auth.uid());
create policy "postings owner delete" on postings for delete using (employer_id=auth.uid());
create policy "postings admin all" on postings for all using (is_admin()) with check (is_admin());
-- site_settings: public read, admin write
create policy "settings read" on site_settings for select using (true);
create policy "settings admin write" on site_settings for all using (is_admin()) with check (is_admin());

-- Make yourself admin AFTER your first Google sign-in:
-- update public.profiles set role='admin', onboarded=true where email='you@gmail.com';
