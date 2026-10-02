# VERITY — Public Evidence & Intelligence Verification Engine

VERITY is an open-source, evidence-anchored intelligence platform for verifying public claims, events, corporate announcements, and regulatory disclosures. Built with a zero-hallucination, deterministic architecture, VERITY cross-examines information across statutory records, global news wires, social platforms, and community contributions without relying on opaque scoring models.

---

## Key Capabilities

- **Multi-Platform Source Retrieval**: Queries across 7 platform adapters (Global News & RSS, Statutory/Government Portals, Reddit Discussions, YouTube Captions & Metadata, Discussion Forums, X/Twitter API, and Instagram/Meta Graph) with strict platform terms compliance and transparent access reporting.
- **Hard Claim Relevance Gate**: Validates retrieved content against the exact target entity and predicate claim before evidence is scored, eliminating false-positive keyword overlap traps.
- **Deterministic Evidentiary Synthesis**: Calibrates factual support scores (0–100 or unassessable null) based on independent publisher origin density, wire syndication penalties, and attributable excerpts.
- **Claim-Specific Community Voting**: Enables authenticated community consensus on specific claims (`Supported`, `Unsupported`, `Insufficient evidence`) with strict 1-vote-per-user isolation, while strictly separating community sentiment from AI factual scoring.
- **Immutable Revision Tracking**: Maintains a complete, traceable audit trail of claim revisions, scores, and underlying evidence modifications over time.
- **Multilingual Localization & Accessibility**: Native UI translation for Indian languages (English, Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati) with Text-to-Speech (TTS) audio narration of synthesized dossiers.
- **Role-Based Moderation & SSRF Guards**: Secure submission staging with automated spam honeypots, URL protocol validation, private IP blocking (SSRF guards), and cryptographic JWT moderator approval workflows.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, CSS Custom Properties
- **Icons & Visuals**: Lucide React, Recharts
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies, with resilient local in-memory fallback for offline development
- **Security**: Cryptographic JWT authentication, SSRF protection, strict CORS, input sanitization

---

## Local Development Setup

### 1. Prerequisites
- Node.js 20.x or 22.x+
- npm (or pnpm / yarn)

### 2. Installation
```bash
git clone https://github.com/devSatyamm/Verity.git
cd Verity
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the following environment variables (by name):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project API URL (optional for offline mode)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public anonymous client key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase server-only service role key (never expose to browser)
- `VERITY_AUTH_SECRET` — Cryptographic secret for signing session JWT tokens
- `MODERATOR_API_SECRET` — Server secret key for automated scheduler or privileged API calls
- `CRON_SECRET` — Secret bearer token for autonomous discovery cron execution
- `GEMINI_API_KEY` / `OPENAI_API_KEY` — Optional AI provider keys for auxiliary research synthesis
- `X_BEARER_TOKEN` / `TWITTER_BEARER_TOKEN` — Optional official X API v2 bearer token
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` — Optional official Reddit Data API credentials

*Note: VERITY includes an in-memory database and deterministic research engine that functions out-of-the-box for local testing without external API keys.*

---

## Database Migrations

VERITY schemas are managed via incremental Supabase PostgreSQL migrations located in `supabase/migrations/`:

```
supabase/migrations/
├── 20261002000000_verity_core_schema.sql
├── 20261002000001_verity_ingestion_engine.sql
├── 20261002000002_verity_autonomous_intelligence.sql
├── 20261002000003_verity_community_voting.sql
└── 20261002000004_verity_multiplatform_social_intelligence.sql
```

To apply migrations to your Supabase project:
```bash
npx supabase db push
```
Or execute the SQL migration files sequentially in the Supabase SQL Editor.

---

## Development & Testing Commands

```bash
# Start local development server (port 3000)
npm run dev

# Run TypeScript typecheck
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start

# Run end-to-end and regression test suites
npx tsx tests/test_relevance_regression.mjs
npx tsx tests/verify_ai_assessment_and_voting_e2e.mjs
npx tsx tests/verify_multiplatform_social_intelligence.mjs
npx tsx tests/verify_query_relevance_and_grounding.mjs
npx tsx tests/verify_phase4_e2e_workflow.mjs
npx tsx tests/verify_phase5_autonomous_engine.mjs
```

---

## Production Deployment (Vercel)

VERITY is a full-stack Next.js application requiring server runtime support for:
- Live external internet multi-platform search adapters
- SSRF-protected content fetching & metadata resolution
- Server-side JWT authentication & session issuance
- Atomic community voting & claim revision persistence
- Automated background discovery cron triggers (`vercel.json`)

### Deploying to Vercel
1. Import the repository `devSatyamm/Verity` into your [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset will be automatically detected as **Next.js**.
3. Build Command: `next build` (or `npm run build`), Output Directory: `.next`.
4. Configure required Environment Variables in the Vercel project settings (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MODERATOR_API_SECRET`, `VERITY_AUTH_SECRET`).
5. Deploy. Vercel automatically activates the hourly discovery cron specified in [`vercel.json`](./vercel.json).

### Note on GitHub Pages
GitHub Pages provides static-only HTML file hosting. It does not execute Node.js API routes (`/api/*`), handle SSRF proxy validation, or maintain persistent server states. If GitHub Pages is enabled on the repository (`Settings` → `Pages`), GitHub automatically runs Jekyll to render markdown files (`README.md`). For production access, use the live Vercel deployment and disable GitHub Pages in repository settings (`Source: None`).

---

## License

This project is licensed under the MIT License.

