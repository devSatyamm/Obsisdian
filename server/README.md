# VERITY Backend Server & API Reference

This directory contains the reference Next.js API route handlers, authentication mechanisms, and autonomous background crawler tasks for VERITY.

## Architecture Note: Frontend-First Static Export
The primary VERITY web application is configured for continuous, resilient static deployment via GitHub Pages at:
`https://devsatyamm.github.io/Obsisdian/`

Because GitHub Pages serves static HTML, CSS, and client-side JavaScript without a continuous Node.js runtime, these server route handlers are housed here as an optional external backend service.

## Deploying the Backend API
You can run or deploy this backend independently on any Node.js host (Vercel, Render, Railway, AWS ECS, Fly.io):
1. Configure environment variables (Supabase URL, Service Role Key, Gemini API Key, Cron Secret).
2. Point your frontend application to this deployed service by setting:
   ```env
   NEXT_PUBLIC_VERITY_API_URL=https://your-api-host.com
   ```
3. When `NEXT_PUBLIC_VERITY_API_URL` is set, the static frontend will automatically route live web crawling, database queries, and authenticated actions to this service.

## Included Endpoints
- `/api/search/live` — Multi-engine internet crawl and AI synthesis
- `/api/auth/*` — User authentication, login, register, and session validation
- `/api/organisations/*` — Entity catalog and verified public filings
- `/api/claims/*` — Version-controlled claims and community polling
- `/api/discovery/*` — Autonomous scheduled crawler and regulatory scraping
- `/api/submissions/*` — Community evidence submission and moderation queue
- `/api/health/db` — Supabase database health and status
