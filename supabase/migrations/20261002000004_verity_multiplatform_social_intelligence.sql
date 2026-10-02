-- =====================================================================
-- Migration: 20261002000004_verity_multiplatform_social_intelligence.sql
-- Description: Unified Source Platform Registry, Multi-Platform Retrieval Logs, and Content Provenance
-- =====================================================================

-- 1. Unified Source Platform Registry
create table if not exists public.source_platform_registry (
  id text primary key,
  platform_key text not null unique,
  display_name text not null,
  source_category text not null check (source_category in ('news', 'social_media', 'forums', 'official', 'public_records')),
  adapter_type text not null,
  is_enabled boolean not null default true,
  rate_limit_rpm integer not null default 60,
  auth_status text not null check (auth_status in ('connected', 'live', 'auth_required', 'restricted', 'disabled')),
  access_limitations text,
  documentation_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Default Platform Adapters
insert into public.source_platform_registry (id, platform_key, display_name, source_category, adapter_type, is_enabled, rate_limit_rpm, auth_status, access_limitations, documentation_url)
values
  ('plat_news_web', 'news', 'Global & National News Outlets', 'news', 'rss_web_search', true, 120, 'live', 'Full real-time RSS and search indexing with wire-syndication detection', 'https://news.google.com'),
  ('plat_official_gov', 'official', 'Official Government & Institutional Portals', 'official', 'institutional_search', true, 60, 'live', 'Accesses PIB, .gov.in, court gazettes, and official institutional announcements', 'https://pib.gov.in'),
  ('plat_reddit', 'reddit', 'Reddit Public Discussions & Communities', 'social_media', 'reddit_public_json', true, 30, 'live', 'Public subreddit discussions via rate-limited JSON API; extracts user speculation & eyewitness claims', 'https://www.reddit.com/dev/api'),
  ('plat_youtube', 'youtube', 'YouTube Public Video Transcripts & Metadata', 'social_media', 'youtube_metadata_api', true, 60, 'live', 'Public video metadata, descriptions, captions, and official broadcasts', 'https://developers.google.com/youtube/v3'),
  ('plat_forums_hn', 'forums', 'HackerNews & Public Technical Forums', 'forums', 'hn_algolia_api', true, 60, 'live', 'Public discussions and verified tech/policy forum threads via Algolia API', 'https://hn.algolia.com/api'),
  ('plat_x_twitter', 'x', 'X (formerly Twitter) Public Conversations', 'social_media', 'x_twitter_v2_api', true, 30, 'auth_required', 'Platform terms require X API v2 Bearer Token. Unauthenticated scraping strictly prohibited.', 'https://developer.x.com'),
  ('plat_instagram', 'instagram', 'Instagram Public Media & Official Statements', 'social_media', 'meta_graph_api', true, 30, 'restricted', 'Platform privacy controls require Meta Graph API OAuth credentials and app review.', 'https://developers.facebook.com')
on conflict (platform_key) do update set
  display_name = excluded.display_name,
  auth_status = excluded.auth_status,
  access_limitations = excluded.access_limitations,
  updated_at = timezone('utc'::text, now());

-- 2. Multi-Platform Retrieval Logs
create table if not exists public.multiplatform_retrieval_logs (
  id text primary key,
  query text not null,
  platform text not null,
  status text not null, -- 'success', 'rate_limited', 'auth_required', 'restricted', 'error'
  items_retrieved integer not null default 0,
  execution_time_ms integer not null default 0,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fast Index for query audits
create index if not exists idx_retrieval_logs_query on public.multiplatform_retrieval_logs(query);
create index if not exists idx_retrieval_logs_platform on public.multiplatform_retrieval_logs(platform);

-- 3. Content Provenance Records
create table if not exists public.content_provenance_records (
  id text primary key,
  platform text not null,
  source_url text not null,
  author text,
  content_type text not null, -- 'firsthand_eyewitness', 'official_statement', 'user_speculation', 'repost', 'satire', 'unverified_allegation', 'corroborated_evidence', 'news_reporting'
  is_original boolean not null default true,
  is_repost boolean not null default false,
  is_duplicate boolean not null default false,
  canonical_url text,
  engagement_note text,
  metadata_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_provenance_url on public.content_provenance_records(source_url);
create index if not exists idx_provenance_platform on public.content_provenance_records(platform);

-- 4. Safe Row Level Security
alter table public.source_platform_registry enable row level security;
alter table public.multiplatform_retrieval_logs enable row level security;
alter table public.content_provenance_records enable row level security;

create policy "Allow public read on source_platform_registry"
  on public.source_platform_registry for select
  using (true);

create policy "Allow public read on multiplatform_retrieval_logs"
  on public.multiplatform_retrieval_logs for select
  using (true);

create policy "Allow public read on content_provenance_records"
  on public.content_provenance_records for select
  using (true);
