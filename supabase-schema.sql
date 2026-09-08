
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'started',
  prenom text not null,
  email text not null,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  answers jsonb not null default '{}'::jsonb,
  profil text,
  synthese text,
  indice_clarte integer,
  forces jsonb not null default '[]'::jsonb,
  pistes jsonb not null default '[]'::jsonb,
  recommandation jsonb not null default '{}'::jsonb,
  plan_7_jours jsonb not null default '[]'::jsonb
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_marketing_idx on public.leads (marketing_consent);

alter table public.leads enable row level security;
