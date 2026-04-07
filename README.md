# ReportAssist

ReportAssist is a web platform for citizens to report non-emergency crimes to the police via an AI-driven interview process.

## Project Overview

The system implements a tracked report lifecycle and role-based dashboards:

- Citizen: AI-guided reporting + case tracking
- Officers: triage/assignment + investigation workflow
- Admin: audit log review + user deactivation

## Technical Stack

- **Frontend**: React (Hooks) + React Router + Context API + Supabase client + Realtime subscriptions
- **Backend**: Node.js + Express.js (OOP layered architecture: controllers/services/repositories/models)
- **Database**: Supabase PostgreSQL (+ RLS)
- **Authentication**: Supabase Auth (JWT) + RBAC + session invalidation via `session_version`
- **AI**: Botpress webhook posts to backend `POST /api/reports/from-ai`

## Getting Started

### 1) Database (Supabase)

- Apply `database/sql/001_reportassist_schema.sql` in your Supabase SQL editor.
- Create users in Supabase Auth, and ensure each auth user has a matching row in `public.users`.

### 2) Backend

In `backend/.env`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for DB writes + admin actions)
- `BOTPRESS_WEBHOOK_SECRET`
- `CORS_ORIGIN` (optional; comma-separated)

Run:

- `npm install --prefix backend`
- `npm run dev:backend`

### 3) Frontend

In `frontend/.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL` (default `http://localhost:4000`)
- `VITE_BOTPRESS_HOST` and `VITE_BOTPRESS_BOT_ID` (optional)

Run:

- `npm install --prefix frontend`
- `npm run dev:frontend`