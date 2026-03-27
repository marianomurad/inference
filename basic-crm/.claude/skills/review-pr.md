# Skill: Review PR — basic-crm

Review a pull request against basic-crm's architecture and conventions.

## Input
PR number or branch name, or paste the diff directly.

## Review Checklist

### Backend (Go)
- [ ] No business logic in handlers — handlers only parse + call service + respond
- [ ] No raw DB queries in services — all queries go through repository
- [ ] Deal values stored/transmitted as int64 (cents), never float
- [ ] IDs are uuid.UUID, never int or string
- [ ] All times in UTC, formatted as RFC3339 in JSON
- [ ] Errors returned as structured JSON with error code
- [ ] No fmt.Println or log.Println — zerolog used
- [ ] New routes registered in router.go with correct RBAC middleware
- [ ] Migration has both up and down SQL
- [ ] Search uses tsvector / plainto_tsquery — no LIKE queries
- [ ] No WebSocket code added

### Frontend (TypeScript/React)
- [ ] No `any` type used
- [ ] No raw `fetch` or `useEffect` for data fetching — Tanstack Query used
- [ ] No prop drilling beyond 2 levels — Zustand used for shared state
- [ ] Forms use React Hook Form + Zod
- [ ] `cn()` used for conditional classNames
- [ ] `formatCurrency()` used for deal value display
- [ ] New API functions added to `lib/api/` (not inline in components)
- [ ] Query keys from `lib/api/query-keys.ts`
- [ ] Mutations invalidate relevant queries on success
- [ ] Kanban uses @dnd-kit only (not react-beautiful-dnd)
- [ ] Live data queries use `refetchInterval: 60_000`

### General
- [ ] No hardcoded environment-specific values
- [ ] No secrets or credentials committed
- [ ] Backend runs on port 8081, not 8080

## Issue Severity
- **Critical** — blocks merge (security, data corruption, broken functionality)
- **Warning** — should fix before merge (convention violation, missing validation)
- **Suggestion** — nice to have (style, optimization, naming)
