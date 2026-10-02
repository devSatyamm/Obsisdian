-- ==============================================================================
-- VERITY: Public Claim Intelligence Platform — Core Database Schema
-- Migration: 20261002000000_verity_core_schema.sql
-- ==============================================================================
-- Non-destructive, idempotent migration safe for fresh or existing databases.
-- Preserves all existing records and will not execute DROP TABLE.
-- ==============================================================================

-- 1. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ==============================================================================
-- 2. Core Tables (Idempotent Creation)
-- ==============================================================================

-- 2.1 Organisations / Entities Table
create table if not exists public.organisations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  category text not null,
  registration_status text not null default 'Unregistered',
  verification_badge text not null default 'Community Watchlist',
  website text,
  short_description text,
  executive_summary text,
  aliases text[] default '{}',
  identifiers jsonb default '{}'::jsonb,
  is_demo_entity boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Backwards compatibility view for entities
create or replace view public.entities as select * from public.organisations;

-- 2.2 Claims Table
create table if not exists public.claims (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  title text not null,
  category text,
  status text not null default 'Active', -- 'Verified', 'Under review', 'Updated', 'Clarified', 'Retracted', 'Active'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.3 Sources Repository Table
create table if not exists public.source_records (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  title text not null,
  source_name text not null,
  source_type text not null, -- 'Regulator (SEBI/RBI/MCA)', 'Corporate Filing', 'Investigative Press', 'Court Document', 'Official Platform Terms'
  url text not null,
  publication_date date,
  retrieval_date date not null default current_date,
  tier int not null default 1 check (tier between 1 and 4),
  snippet text,
  archive_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.4 Claim Versions Table (Immutable Historical Statements)
create table if not exists public.claim_versions (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid references public.claims(id) on delete cascade not null,
  version_number int not null,
  statement_text text not null,
  change_summary text,
  diff_snippet text,
  source_id uuid references public.source_records(id) on delete set null,
  source_url text,
  source_title text,
  publication_date date,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contributor_id text,
  contributor_name text,
  contributor_role text default 'Verified Contributor',
  moderated_by text,
  review_state text not null default 'published' check (review_state in ('draft', 'pending', 'published', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_claim_version unique (claim_id, version_number)
);

-- 2.5 Evidence Items Table
create table if not exists public.evidence_items (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  claim_id uuid references public.claims(id) on delete set null,
  title text not null,
  category text not null,
  description text not null,
  source_id uuid references public.source_records(id) on delete set null,
  source_title text,
  source_url text,
  submitted_by text not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verified_at timestamp with time zone,
  verification_state text not null default 'Community Corroborated',
  supporting_file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.6 Official Regulatory Notices Table
create table if not exists public.official_notices (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  regulator text not null check (regulator in ('SEBI', 'RBI', 'MCA', 'State Police / EOW')),
  order_number text,
  notice_type text not null,
  date_issued date not null,
  headline text not null,
  summary text not null,
  official_pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.7 Community Submissions (Contributions Queue)
create table if not exists public.community_submissions (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references public.organisations(id) on delete set null,
  claim_id uuid references public.claims(id) on delete set null,
  organisation_name text not null,
  category text not null,
  evidence_category text not null,
  title text not null,
  factual_description text not null,
  proposed_statement_text text,
  diff_snippet text,
  primary_source_url text not null,
  source_publication_date date,
  submitted_by_id text,
  submitted_by_name text not null,
  submitted_by_role text not null default 'Contributor',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'clarification_needed')),
  moderation_notes text,
  reviewed_by text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.8 Profile Revisions (Traceable Audit Ledger)
create table if not exists public.profile_revisions (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references public.organisations(id) on delete cascade not null,
  version_number int not null,
  author_name text not null,
  author_role text not null default 'Verified Contributor',
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  summary_of_change text not null,
  moderated_by text not null,
  diff_snippet text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.9 Moderation Audits (Formal Review History)
create table if not exists public.moderation_audits (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid references public.community_submissions(id) on delete cascade not null,
  action text not null check (action in ('approve', 'reject', 'clarification_requested')),
  reviewer_name text not null,
  reviewer_role text not null,
  notes text,
  resulting_revision_id uuid references public.profile_revisions(id) on delete set null,
  resulting_claim_version_id uuid references public.claim_versions(id) on delete set null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. Indexes for High-Performance Queries (Idempotent)
-- ==============================================================================
create index if not exists idx_organisations_slug on public.organisations(slug);
create index if not exists idx_organisations_category on public.organisations(category);
create index if not exists idx_claims_org on public.claims(organisation_id);
create index if not exists idx_claim_versions_claim on public.claim_versions(claim_id, version_number);
create index if not exists idx_sources_org on public.source_records(organisation_id);
create index if not exists idx_evidence_org on public.evidence_items(organisation_id);
create index if not exists idx_submissions_status on public.community_submissions(status);
create index if not exists idx_submissions_claim on public.community_submissions(claim_id);
create index if not exists idx_submissions_org on public.community_submissions(organisation_id);
create index if not exists idx_revisions_org on public.profile_revisions(organisation_id);

-- ==============================================================================
-- 4. Immutability Enforcement for Claim Versions
-- ==============================================================================
create or replace function public.enforce_claim_version_immutability()
returns trigger as $$
begin
  if (TG_OP = 'UPDATE') then
    if (OLD.review_state = 'published') then
      raise exception 'VERITY Security Violation: Published claim versions are immutable and cannot be updated.';
    end if;
  elsif (TG_OP = 'DELETE') then
    if (OLD.review_state = 'published') then
      raise exception 'VERITY Security Violation: Published claim versions cannot be deleted from historical public ledger.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_claim_version_immutability on public.claim_versions;
create trigger trg_claim_version_immutability
before update or delete on public.claim_versions
for each row execute function public.enforce_claim_version_immutability();

-- ==============================================================================
-- 5. Row Level Security (RLS) Policies (Idempotent Setup)
-- ==============================================================================
alter table public.organisations enable row level security;
alter table public.claims enable row level security;
alter table public.claim_versions enable row level security;
alter table public.source_records enable row level security;
alter table public.evidence_items enable row level security;
alter table public.official_notices enable row level security;
alter table public.community_submissions enable row level security;
alter table public.profile_revisions enable row level security;
alter table public.moderation_audits enable row level security;

-- 5.1 Public Read Policies for Published Records
drop policy if exists "Public can view organisations" on public.organisations;
create policy "Public can view organisations"
  on public.organisations for select using (true);

drop policy if exists "Public can view claims" on public.claims;
create policy "Public can view claims"
  on public.claims for select using (true);

drop policy if exists "Public can view published claim versions" on public.claim_versions;
create policy "Public can view published claim versions"
  on public.claim_versions for select
  using (review_state = 'published');

drop policy if exists "Public can view sources" on public.source_records;
create policy "Public can view sources"
  on public.source_records for select using (true);

drop policy if exists "Public can view evidence items" on public.evidence_items;
create policy "Public can view evidence items"
  on public.evidence_items for select using (true);

drop policy if exists "Public can view official notices" on public.official_notices;
create policy "Public can view official notices"
  on public.official_notices for select using (true);

drop policy if exists "Public can view profile revisions" on public.profile_revisions;
create policy "Public can view profile revisions"
  on public.profile_revisions for select using (true);

drop policy if exists "Public can view moderation audits" on public.moderation_audits;
create policy "Public can view moderation audits"
  on public.moderation_audits for select using (true);

-- 5.2 Submissions: Public Insertion & Controlled Viewing
drop policy if exists "Anyone can submit new findings for review" on public.community_submissions;
create policy "Anyone can submit new findings for review"
  on public.community_submissions for insert
  with check (status = 'pending');

drop policy if exists "Public can view community submissions" on public.community_submissions;
create policy "Public can view community submissions"
  on public.community_submissions for select
  using (true);

-- 5.3 Privileged Operations (Service Role / Server Logic)
-- Service role bypasses RLS by default in Supabase.
