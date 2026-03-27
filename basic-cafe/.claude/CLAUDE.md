# basic-cafe — Claude Code Configuration

## Project Overview

**basic-cafe** is a full-stack cafeteria administration application living inside the `inference` monorepo. It consists of:

- `backend/` — Go 1.22 + Fiber v2 + GORM + PostgreSQL
- `frontend/` — Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui

See `plans/` for detailed architecture documents:
- `plans/analysis.md` — Technical analysis and decision rationale
- `plans/backend.md` — Go backend full plan
- `plans/frontend.md` — Next.js frontend full plan

---

## Key Conventions

### Backend (Go)
- **Clean Architecture**: domain → repository → service → handler. Never skip layers.
- Prices are always stored and transmitted as **integer cents** (int64). Never floats.
- IDs are **UUID v4** everywhere. Use `github.com/google/uuid`.
- All time values use **UTC**. Format as RFC3339 in JSON responses.
- Error responses follow this shape:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "human readable", "details": {} } }
  ```
- Use `zerolog` for structured logging. Never use `fmt.Println` in production paths.
- DB queries live in `internal/repository/`, never inline in handlers or services.

### Frontend (Next.js / TypeScript)
- Strict TypeScript — no `any`, no `as unknown as`.
- All server state via **Tanstack Query**. Never fetch in `useEffect` directly.
- All client state via **Zustand**. No prop drilling beyond 2 levels.
- Forms always use **React Hook Form + Zod**. No uncontrolled inputs.
- Use `cn()` from `lib/utils.ts` for conditional class merging (clsx + tailwind-merge).
- Currency display: always use `formatCurrency()` from `lib/utils.ts`. Never format inline.
- Components in `components/ui/` are shadcn/ui owned copies — do not edit unless customizing.

### Shared
- Payment logic is **always behind the Provider interface** in `backend/internal/payment/`. Do not call any payment SDK directly from handlers or services.
- WebSocket events are defined in `plans/backend.md` — do not add new event names without updating that doc.

---

## Available Agents

See `.claude/agents/` for specialized agents:
- `backend-engineer.md` — Go backend tasks, migrations, API design
- `frontend-engineer.md` — Next.js, React, UI/UX tasks

## Available Skills

See `.claude/skills/` for reusable skill prompts:
- `add-feature.md` — scaffold a new full-stack feature end-to-end
- `review-pr.md` — review a PR against project conventions
- `run-tests.md` — run and interpret test output
- `add-api-route.md` — add a new API route (handler + service + repo)
- `add-page.md` — scaffold a new frontend page with all standard patterns

---

## Development Setup

```bash
# Start all services
docker-compose up -d

# Backend (with hot reload)
cd backend && air

# Frontend
cd frontend && npm run dev
```

Backend: http://localhost:8080
Frontend: http://localhost:3000
PgAdmin: http://localhost:5050

---

## Do Not

- Do not add `fmt.Println` or `log.Println` to Go code — use zerolog
- Do not store prices as floats — always integer cents
- Do not call payment provider SDKs outside of `internal/payment/`
- Do not use `any` type in TypeScript
- Do not fetch data in `useEffect` — use Tanstack Query
- Do not hardcode environment-specific values — use env vars
- Do not create new shadcn components from scratch — extend existing ones
