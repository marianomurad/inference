# Skill: Add API Route (Backend)

Add a new API endpoint following basic-crm's clean architecture pattern.

## Input
- HTTP method + path (e.g. `PATCH /api/v1/deals/:id/stage`)
- What it does
- Required roles (admin / manager / sales_rep)
- Request body shape
- Response shape

## Steps

1. **Repository** — add method to `backend/internal/repository/[domain]_repo.go`
   - Pure GORM query, return domain type or error
   - No business logic

2. **Service** — add method to `backend/internal/service/[domain]_service.go`
   - Validate business rules
   - Call repository method(s)
   - Return domain type or domain error

3. **Handler** — add handler func to `backend/internal/handler/[domain]_handler.go`
   - Parse path params and request body
   - Validate with go-playground/validator
   - Call service
   - Return JSON response with appropriate status code

4. **Router** — register route in `backend/internal/router/router.go`
   - Apply auth middleware
   - Apply RBAC middleware with required roles

## Error Codes Reference
- `VALIDATION_ERROR` → 400
- `NOT_FOUND` → 404
- `CONFLICT` → 409
- `UNAUTHORIZED` → 401
- `FORBIDDEN` → 403
- `INTERNAL_ERROR` → 500

## CRM-Specific Notes
- Deal values always `int64` (cents) in request/response
- Contact status changes: validate lifecycle (`lead → prospect → customer → churned`)
- Deal stage moves: validate stage exists, update `stage_id` only (not status)
- Deal won/lost: update `status` field only (not stage)
