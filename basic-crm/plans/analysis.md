# Basic CRM — Technical Analysis

## Project Overview

**basic-crm** is a full-stack Customer Relationship Management application. It covers contact management, company tracking, deal pipeline, activity logging, task management, and sales reporting. It lives as an application within the `inference` monorepo.

---

## Feature Breakdown

| Domain | Capabilities |
|---|---|
| **Contacts** | Create/update/archive people (leads, prospects, customers, churned), link to companies, tag, assign owner |
| **Companies** | Organizations linked to contacts, industry, website, size, revenue tracking |
| **Deals / Pipeline** | Kanban board + list view, configurable stages, deal value, close date, status (open/won/lost) |
| **Activities** | Log calls, emails, meetings, notes — attached to contacts or deals |
| **Tasks** | Follow-up reminders with due dates, assignees, and done state |
| **Global Search** | Full-text search across contacts, companies, and deals via command palette |
| **Reports** | Pipeline value by stage, conversion rates, won/lost trends, activity breakdown |
| **Auth & Roles** | Admin, Manager, Sales Rep — role-based access control |

---

## Backend Language Analysis

### Decision: **Go + Fiber** (same as basic-cafe)

Rationale (unchanged):
1. Lowest hallucination risk — Go is explicit, opinionated, strongly typed
2. The compiler enforces correctness — errors surface at build time, not runtime
3. Fiber + GORM + PostgreSQL is a mature, widely-documented stack
4. Single binary deployment — no runtime surprises
5. Performance is more than sufficient for a CRM workload

No WebSocket needed — CRM data is not real-time critical. Polling every 60 seconds via Tanstack Query is sufficient. This simplifies the backend considerably compared to basic-cafe.

---

## Frontend Framework Analysis

### Decision: **Next.js 15 (App Router)** (same as basic-cafe)

Same stack as basic-cafe:

| Library | Role |
|---|---|
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui** | Owned component copies |
| **Lucide React** | Icons |
| **Framer Motion** | Page transitions |
| **Tanstack Query v5** | Server state, 60s polling |
| **Zustand** | Client UI state |
| **React Hook Form + Zod** | Forms with validation |
| **Recharts** | Pipeline and activity charts |
| **Sonner** | Toast notifications |
| **date-fns** | Date formatting |
| **ky** | HTTP client |
| **@dnd-kit/core + @dnd-kit/sortable** | Kanban board drag-and-drop |

---

## Database Strategy

### Primary: PostgreSQL 16
Relational integrity for contacts, companies, deals, and activities.

### Cache / Sessions: Redis 7
JWT refresh token storage and rate limiting.

### Schema Domains

```
users              — auth, roles (admin/manager/sales_rep)
contacts           — people with status lifecycle
companies          — organizations
contact_company    — many-to-many link
deal_stages        — configurable pipeline stages (name, position, color)
deals              — pipeline entries
deal_contacts      — many-to-many link
activities         — call/email/meeting/note log
tasks              — follow-up reminders
tags               — reusable labels
contact_tags       — many-to-many link
audit_log          — immutable mutation history
```

---

## CRM-Specific Design Decisions

### No Payment Provider
Unlike basic-cafe, basic-crm has no payment processing. Deal values are stored in cents (int64) for consistency but never charged.

### No WebSocket
CRM data does not require sub-second updates. Tanstack Query polls every 60 seconds. This reduces backend complexity significantly.

### Pipeline Stages are Configurable
`deal_stages` is a user-managed table (not hardcoded). Stages have a `position` integer for ordering. Default stages: Lead In → Qualified → Proposal → Negotiation → Closed Won / Closed Lost.

### Contact Status Lifecycle
`lead → prospect → customer → churned`
Status is set manually or via deal closure rules (won deal → customer, lost all deals → prospect).

### Global Search
Backend exposes `GET /api/v1/search?q=` which queries contacts (name, email), companies (name), and deals (title) using PostgreSQL full-text search (`to_tsvector` + `plainto_tsquery`). Returns a unified result list with type tags.

---

## Monorepo Structure (within `inference/`)

```
inference/
└── basic-crm/
    ├── .claude/               ← Claude Code configuration
    ├── plans/                 ← Architecture documents (this folder)
    ├── backend/               ← Go API server
    │   ├── cmd/server/
    │   ├── internal/
    │   │   ├── domain/
    │   │   ├── handler/
    │   │   ├── middleware/
    │   │   ├── repository/
    │   │   └── service/
    │   ├── migrations/
    │   └── Dockerfile
    ├── frontend/              ← Next.js app
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   └── Dockerfile
    ├── docker-compose.yml
    └── .env.example
```

---

## Deployment Considerations

- Both services containerized with Docker
- `docker-compose.yml` for local development (Postgres + Redis + backend + frontend)
- Backend health endpoint: `GET /health`
- Frontend communicates with backend via `NEXT_PUBLIC_API_URL`
- No `NEXT_PUBLIC_WS_URL` needed

---

## Development Priorities

1. Auth (JWT, roles)
2. Contacts CRUD + status lifecycle
3. Companies CRUD + contact linking
4. Deal stages config + deals CRUD
5. Pipeline Kanban board (drag-to-move)
6. Activities log
7. Tasks with due dates
8. Global search
9. Reports dashboard
10. Settings (users, stages, tags)
