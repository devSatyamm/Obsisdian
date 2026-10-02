-- ==============================================================================
-- VERITY: Autonomous Intelligence Engine — Fetched Documents & Metadata Schema
-- Migration: 20261002000002_verity_autonomous_intelligence.sql
-- ==============================================================================
-- Non-destructive, idempotent migration safe for fresh or existing databases.
-- Stores public document audit records, canonical URLs, publication metadata,
-- and content hashes without storing massive raw web blobs indefinitely.
-- ==============================================================================

-- 1. Fetched Documents Ledger Table
create table if not exists public.fetched_documents (
  id text primary key default (uuid_generate_v4())::text,
  source_id text references public.discovery_sources(id) on delete set null,
  url text not null,
  canonical_url text not null,
  headline text not null,
  author text,
  publisher text not null,
  published_date timestamp with time zone,
  retrieved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content_hash text not null,
  word_count int not null default 0,
  clean_excerpt text,
  status text not null default 'processed' check (status in ('processed', 'duplicate', 'filtered_as_boilerplate', 'changed_version')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Indexes for Document Queries
create index if not exists idx_fetched_documents_canonical on public.fetched_documents(canonical_url);
create index if not exists idx_fetched_documents_hash on public.fetched_documents(content_hash);
create index if not exists idx_fetched_documents_source on public.fetched_documents(source_id);
create index if not exists idx_fetched_documents_retrieved on public.fetched_documents(retrieved_at);

-- 3. Row Level Security (RLS)
alter table public.fetched_documents enable row level security;

-- 3.1 Public can inspect fetched document metadata for provenance verification
drop policy if exists "Public can view fetched document metadata" on public.fetched_documents;
create policy "Public can view fetched document metadata"
  on public.fetched_documents for select
  using (true);

-- 3.2 Privileged server-side service role manages inserts and updates (bypasses RLS)
