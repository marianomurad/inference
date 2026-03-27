# Skill: Add Full-Stack Feature

Scaffold a new feature end-to-end for basic-crm.

## Input
Describe the feature: what it does, what domain it belongs to, any special requirements.

## Steps

### 1. Backend
- Add or update domain struct in `backend/internal/domain/`
- Write migration file in `backend/migrations/` (up + down)
- Implement repository methods in `backend/internal/repository/`
- Implement service methods in `backend/internal/service/`
- Implement handler in `backend/internal/handler/`
- Register route(s) in `backend/internal/router/router.go`
- Update RBAC middleware if new permission levels needed
- If feature involves search: add `tsvector` column + GIN index to migration

### 2. Frontend
- Add API function(s) in `frontend/lib/api/[domain].ts`
- Add query keys in `frontend/lib/api/query-keys.ts`
- Add Zod schema if forms needed: `frontend/lib/schemas/[domain].schema.ts`
- Create feature components in `frontend/components/[domain]/`
- Create page file in `frontend/app/(dashboard)/[route]/page.tsx`
- Add sidebar nav entry in `frontend/components/layout/sidebar.tsx`
- If Kanban: use @dnd-kit/core + @dnd-kit/sortable

### 3. Verification
- Confirm domain model matches DB migration
- Confirm API response shape matches TypeScript types
- Confirm form Zod schema covers all required fields
- Confirm RBAC rules cover all new routes
- If search: confirm tsvector generated column is in migration
