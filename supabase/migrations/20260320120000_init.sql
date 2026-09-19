-- Black Horse Ink leads schema

create type public.lead_status as enum (
  'new',
  'contacted',
  'quoted',
  'booked',
  'lost'
);

create type public.sms_sync_status as enum (
  'pending',
  'sent',
  'failed',
  'skipped'
);

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  phone_e164 text not null,
  email text,
  artist_id text,
  idea text not null,
  size text not null,
  placement text not null,
  placement_notes text,
  timing text,
  status public.lead_status not null default 'new',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  landing_page text,
  referrer text,
  quo_contact_id text,
  sms_sync_status public.sms_sync_status not null default 'pending',
  sms_error text,
  lead_detail_token uuid not null default gen_random_uuid()
);

create table public.lead_images (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  storage_path text not null,
  mime text not null,
  size_bytes bigint not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel text not null default 'sms',
  provider text not null,
  summary text,
  success boolean not null,
  created_at timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index lead_images_lead_id_idx on public.lead_images (lead_id);

alter table public.leads enable row level security;
alter table public.lead_images enable row level security;
alter table public.communication_logs enable row level security;
alter table public.admin_users enable row level security;

create policy "Admin users read own row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins read leads"
  on public.leads for select
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "Admins update leads"
  on public.leads for update
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "Admins read lead_images"
  on public.lead_images for select
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "Admins read communication_logs"
  on public.communication_logs for select
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('lead-references', 'lead-references', false)
on conflict (id) do nothing;

create policy "Admins read lead reference objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'lead-references'
    and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );
