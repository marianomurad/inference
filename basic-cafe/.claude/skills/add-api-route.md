# Skill: Add API Route (Backend)

Add a new API endpoint following basic-cafe's clean architecture pattern.

## Input
- HTTP method + path (e.g. `POST /api/v1/orders/:id/items`)
- What it does
- Required roles (which roles can call this)
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
   - Parse path params and request body (`c.Params`, `c.BodyParser`)
   - Validate with go-playground/validator
   - Call service
   - Return JSON response with appropriate status code
   - Map service errors to HTTP status codes

4. **Router** — register route in `backend/internal/router/router.go`
   - Apply auth middleware
   - Apply RBAC middleware with required roles
   - Map to handler func

## Error Codes Reference
- `VALIDATION_ERROR` → 400
- `NOT_FOUND` → 404
- `CONFLICT` → 409
- `UNAUTHORIZED` → 401
- `FORBIDDEN` → 403
- `INTERNAL_ERROR` → 500
