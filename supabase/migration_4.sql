-- MeetPol migration 4: richer donation requests. Run once in Supabase SQL Editor (after migration 3).
alter table public.donation_requests
  add column if not exists applicant_name text,
  add column if not exists age int check (age between 1 and 120),
  add column if not exists reason text,
  add column if not exists description text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists bank_account text;
alter table public.donation_requests alter column title drop not null;

-- Re-check trigger: editing any of these public details sends an approved request back to "pending"
create or replace function public.guard_request() returns trigger language plpgsql as $$
begin
  if is_admin() then return new; end if;
  new.user_id := old.user_id;
  if new.status='closed' and old.status in ('approved','closed') then return new; end if;
  if old.status in ('approved','rejected') and (new.applicant_name is distinct from old.applicant_name or new.reason is distinct from old.reason
     or new.description is distinct from old.description or new.bank_account is distinct from old.bank_account
     or new.phone is distinct from old.phone or new.email is distinct from old.email or new.goal_amount is distinct from old.goal_amount) then
    new.status := 'pending';
  else new.status := old.status; end if;
  return new;
end $$;
