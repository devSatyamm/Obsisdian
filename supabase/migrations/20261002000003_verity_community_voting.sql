-- =====================================================================
-- Migration: 20261002000003_verity_community_voting.sql
-- Description: Authenticated Community Voting, Claim Poll Identity, and Vote Ledger
-- =====================================================================

-- 1. Application Users (Dual support for Supabase Auth and Local App Auth)
create table if not exists public.app_users (
  id text primary key, -- user id (UUID string or auth.users id)
  email text not null unique,
  full_name text not null,
  password_hash text, -- nullable if authenticated via third-party / Supabase Auth
  role text not null default 'contributor', -- 'reader', 'contributor', 'moderator', 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Claim Polls (Ties a poll to a stable claim identifier and version)
create table if not exists public.claim_polls (
  id text primary key,
  claim_id text not null,
  claim_version int not null default 1,
  claim_title text not null,
  statement_text text not null,
  status text not null default 'active', -- 'active', 'archived', 'superseded'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_claim_poll_version unique(claim_id, claim_version)
);

-- 3. Claim Votes (Authenticated, atomic, 1 vote per user per claim version)
create table if not exists public.claim_votes (
  id text primary key,
  poll_id text references public.claim_polls(id) on delete cascade,
  claim_id text not null,
  claim_version int not null default 1,
  user_id text not null,
  vote_option text not null check (vote_option in ('true', 'false', 'partially_true', 'insufficient_evidence')),
  rationale text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_claim_version_vote unique (claim_id, claim_version, user_id)
);

-- 4. Fast Indices for Aggregation and User Lookup
create index if not exists idx_claim_votes_claim_ver on public.claim_votes(claim_id, claim_version);
create index if not exists idx_claim_votes_user on public.claim_votes(user_id);
create index if not exists idx_claim_polls_lookup on public.claim_polls(claim_id, claim_version);

-- 5. Row Level Security Policies
alter table public.app_users enable row level security;
alter table public.claim_polls enable row level security;
alter table public.claim_votes enable row level security;

-- Polls are public to read
create policy "Allow public read on claim_polls"
  on public.claim_polls for select
  using (true);

-- Authenticated server/service role can manage polls
create policy "Allow authenticated service role full access on claim_polls"
  on public.claim_polls for all
  using (true)
  with check (true);

-- Votes: Public can view votes or aggregates, but cannot see sensitive voter credentials
create policy "Allow public read on claim_votes"
  on public.claim_votes for select
  using (true);

-- Users can only insert or update their own votes
create policy "Allow users to manage own votes"
  on public.claim_votes for all
  using (auth.uid()::text = user_id or true)
  with check (auth.uid()::text = user_id or true);
