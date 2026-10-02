-- ==============================================================================
-- VERITY: Autonomous Web Discovery & Ingestion Engine Schema
-- Migration: 20261002000001_verity_ingestion_engine.sql
-- ==============================================================================
-- Non-destructive, idempotent migration safe for fresh or existing databases.
-- Stores source configurations, crawling policies, job execution logs, and
-- extraction metadata without dumping raw HTML/PDF documents into Supabase.
-- ==============================================================================

-- 1. Discovery Sources Registry Table
create table if not exists public.discovery_sources (
  id text primary key default (uuid_generate_v4())::text,
  slug text unique not null,
  name text not null,
  source_type text not null check (source_type in ('rss_feed', 'api', 'html_registry', 'press_feed')),
  url text not null,
  target_regulator text, -- 'SEBI', 'RBI', 'MCA', 'General Market'
  organisation_id uuid references public.organisations(id) on delete set null,
  poll_interval_minutes int not null default 60,
  last_polled_at timestamp with time zone,
  last_etag text,
  last_modified_header text,
  is_active boolean not null default true,
  error_count int not null default 0,
  last_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure text id and is_active columns exist if migrating from earlier draft
alter table public.discovery_sources add column if not exists is_active boolean not null default true;
alter table public.discovery_sources add column if not exists error_count int not null default 0;
alter table public.discovery_sources add column if not exists last_error text;

-- 2. Ingestion Jobs Audit Table
create table if not exists public.ingestion_jobs (
  id text primary key default (uuid_generate_v4())::text,
  source_id text references public.discovery_sources(id) on delete cascade not null,
  source_name text not null,
  status text not null check (status in ('running', 'completed', 'failed', 'partial')),
  items_discovered int not null default 0,
  items_extracted int not null default 0,
  claims_identified int not null default 0,
  duplicates_skipped int not null default 0,
  boilerplate_filtered int not null default 0,
  error_log text,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Ensure boilerplate_filtered column exists if table was previously created
alter table public.ingestion_jobs add column if not exists boilerplate_filtered int not null default 0;

-- 3. Indexes for Ingestion Queries
create index if not exists idx_discovery_sources_active on public.discovery_sources(is_active);
create index if not exists idx_discovery_sources_poll on public.discovery_sources(last_polled_at);
create index if not exists idx_ingestion_jobs_source on public.ingestion_jobs(source_id);
create index if not exists idx_ingestion_jobs_started on public.ingestion_jobs(started_at);

-- 4. Row Level Security (RLS)
alter table public.discovery_sources enable row level security;
alter table public.ingestion_jobs enable row level security;

-- 4.1 Public can view active discovery sources
drop policy if exists "Public can view active discovery sources" on public.discovery_sources;
create policy "Public can view active discovery sources"
  on public.discovery_sources for select
  using (is_active = true);

-- 4.2 Public can view ingestion job status
drop policy if exists "Public can view ingestion jobs" on public.ingestion_jobs;
create policy "Public can view ingestion jobs"
  on public.ingestion_jobs for select
  using (true);

-- 4.3 Service Role bypasses RLS by default in Supabase

-- 5. Seed Canonical Ingestion Discovery Sources (Idempotent)
insert into public.discovery_sources (
  id, slug, name, source_type, url, target_regulator, poll_interval_minutes, is_active
) values
(
  'src_rbi_press',
  'rbi-press-releases',
  'Reserve Bank of India (RBI) Press Releases',
  'rss_feed',
  'https://www.rbi.org.in/pressreleases_rss.xml',
  'RBI',
  60,
  true
),
(
  'src_sebi_alerts',
  'sebi-caution-alerts',
  'SEBI Public Caution & Regulatory Notices Feed',
  'rss_feed',
  'https://news.google.com/rss/search?q=SEBI+caution+notice+when:7d&hl=en-IN&gl=IN&ceid=IN:en',
  'SEBI',
  30,
  true
),
(
  'src_bbc_business',
  'bbc-business-markets',
  'BBC Global Business & Financial Markets',
  'rss_feed',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'General Market',
  120,
  true
)
on conflict (slug) do nothing;
