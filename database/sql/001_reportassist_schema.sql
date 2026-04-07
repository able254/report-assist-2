-- ReportAssist (Supabase Postgres) schema + RLS
-- Apply in Supabase SQL editor.

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('Citizen', 'TriageOfficer', 'AssignedOfficer', 'SystemAdmin');
  end if;
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type account_status as enum ('Active', 'Suspended', 'Deactivated');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type report_status as enum (
      'Pending',
      'Under Review',
      'Assigned',
      'In Progress',
      'Closed',
      'Escalated',
      'Rejected'
    );
  end if;
end$$;

-- Case number counter
create table if not exists public.case_number_counters (
  year int primary key,
  last_value int not null
);

-- Atomic counter function used by backend CaseFactory
create or replace function public.next_case_number(p_year int)
returns int
language plpgsql
security definer
as $$
declare v int;
begin
  insert into public.case_number_counters(year, last_value)
  values (p_year, 1)
  on conflict (year) do update
    set last_value = public.case_number_counters.last_value + 1
  returning last_value into v;
  return v;
end;
$$;

-- Users (profile) table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  role user_role not null default 'Citizen',
  account_status account_status not null default 'Active',
  session_version int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null,
  status report_status not null default 'Pending',
  severity_score int not null default 0,
  transcript text not null,
  structured_data jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.users(id),
  assigned_to uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reports_created_by on public.reports(created_by);
create index if not exists idx_reports_assigned_to on public.reports(assigned_to);
create index if not exists idx_reports_status on public.reports(status);

-- Evidence
create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  file_url text not null,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_evidence_report_id on public.evidence(report_id);

-- Audit logs (required fields)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  performed_by uuid,
  target_entity text not null,
  target_id uuid,
  previous_value jsonb,
  new_value jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists idx_audit_logs_timestamp on public.audit_logs(timestamp desc);

-- RLS
alter table public.users enable row level security;
alter table public.reports enable row level security;
alter table public.evidence enable row level security;
alter table public.audit_logs enable row level security;

-- Users can view/update own profile
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users
for select
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
using (id = auth.uid());

-- Reports: citizens can view own reports
drop policy if exists "Users can view own reports" on public.reports;
create policy "Users can view own reports"
on public.reports
for select
using (created_by = auth.uid());

-- Reports: assigned officers can view assigned reports
drop policy if exists "Officers can view assigned reports" on public.reports;
create policy "Officers can view assigned reports"
on public.reports
for select
using (assigned_to = auth.uid());

-- Evidence: owner or assigned can view evidence
drop policy if exists "Users can view evidence for their reports" on public.evidence;
create policy "Users can view evidence for their reports"
on public.evidence
for select
using (
  exists (
    select 1 from public.reports r
    where r.id = evidence.report_id
      and (r.created_by = auth.uid() or r.assigned_to = auth.uid())
  )
);

-- Audit logs: only SystemAdmin (checked via users table)
drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs"
on public.audit_logs
for select
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'SystemAdmin'
  )
);

