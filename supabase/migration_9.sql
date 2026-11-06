-- MeetPol migration 9: real public counters for the homepage. Safe to re-run.
create or replace view public.public_stats as select
  (select count(*) from public.applicants) as seekers,
  (select count(*) from public.postings) as roles,
  (select count(*) from public.donation_requests where status='approved') as campaigns;
grant select on public.public_stats to anon, authenticated;
