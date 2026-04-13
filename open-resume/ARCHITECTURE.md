# Architecture Overview — OpenResume

## System Design

OpenResume is a statically rendered Next.js App Router application with a Supabase backend. It supports two user modes: **Guest** (localStorage + IP-hash tracking) and **Authenticated** (Supabase Auth + Database persistence).

## High-Level Architecture

```
Browser Client
│
├── Landing Page (/)
├── Builder (/builder)
│   ├── ResumeForm (react-hook-form + zod)
│   ├── LivePreview (A4 DOM target for html2pdf)
│   ├── DownloadButton → /api/download/check & /increment
│   └── Auto-save (debounced 5s) → /api/resumes [POST]
│
└── Dashboard (/dashboard)  ← Auth Required
    └── Resume Cards → /api/resumes/[id] [GET, DELETE]

Next.js API Routes (Server)
│
├── /api/resumes          [GET, POST]   — CRUD for resumes
├── /api/resumes/[id]     [GET, DELETE] — Single resume operations
├── /api/download/check   [POST]        — Rate limit inspection
└── /api/download/increment [POST]      — Log download event

Supabase (PostgreSQL)
├── auth.users            — Managed by Supabase Auth
├── public.resumes        — JSONB resume data, RLS enforced
└── public.download_logs  — Anonymous + authenticated tracking
```

## Data Flow

### Guest Download Flow
1. User hits "Download PDF" in builder
2. `DownloadButton` calls `POST /api/download/check`
3. API extracts IP from `x-forwarded-for`, hashes with HMAC SHA-256 + `IP_SALT`
4. Queries `download_logs` for `ip_hash + CURRENT_DATE`
5. Returns `{ allowed: boolean, remaining: number, resetTime: string }`
6. If allowed: `html2pdf.js` renders the `#resume-preview-container` DOM node → Blob → Download
7. On success: calls `POST /api/download/increment` to log the event

### Authenticated Save Flow
1. `ResumeForm` state changes → `ResumeContext` updates
2. Debounced watcher fires after 5s of inactivity
3. `BuilderHeader` checks for active Supabase session
4. If session exists: `POST /api/resumes` with full resume JSON payload
5. Supabase upserts into `public.resumes` (RLS ensures user_id match)

## State Management

| Layer | Mechanism |
|---|---|
| Form state | `react-hook-form` (uncontrolled, fast) |
| Global resume data | `ResumeContext` (useReducer) |
| Session persistence | Supabase SSR cookies via middleware |
| Guest download count | `localStorage` (client-side cache) backed by DB |
| Cloud resume store | Supabase PostgreSQL (JSONB) |

## Security Model

- **RLS Policies**: All `public.resumes` operations require `auth.uid() = user_id`
- **IP Privacy**: Raw IPs never stored — only HMAC SHA-256 hashes with server-side salt
- **Auth Tokens**: Managed as HttpOnly cookies via `@supabase/ssr` (not localStorage)
- **Input Validation**: All API routes validate payloads before DB operations
- **Route Protection**: `middleware.ts` gates `/dashboard` requiring valid session
