# Skill: Run Tests — basic-crm

Run the test suite and interpret results for basic-crm.

## Backend Tests

```bash
cd backend

# Run all tests
go test ./...

# Verbose
go test -v ./...

# Specific package
go test -v ./internal/service/...
go test -v ./internal/handler/...

# Specific test
go test -v -run TestContactService_Create ./internal/service/

# With race detector
go test -race ./...

# With coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Test Conventions (Backend)
- Integration tests use `testcontainers-go` to spin up real PostgreSQL
- Unit tests mock at the repository interface level
- Test files alongside code: `contact_service_test.go`
- Helpers in `internal/testutil/`
- Search tests require real PG (tsvector is a DB feature, not mockable)

## Frontend Tests

```bash
cd frontend

# Unit + component tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E (Playwright)
npm run test:e2e
```

### Test Conventions (Frontend)
- Component tests: React Testing Library
- Hook tests: renderHook
- API mocks: MSW (Mock Service Worker)
- Kanban tests: mock dnd-kit drag events via `@testing-library/user-event`
- E2E: Playwright — remember frontend runs on port 3001

## Interpreting Failures

1. **Go compilation errors** — fix type errors first
2. **DB connection in tests** — check testcontainers, Docker must be running
3. **tsvector search test failing** — ensure test DB has the generated columns (run migrations)
4. **dnd-kit drag test failures** — check that `@testing-library/user-event` v14+ is used
5. **MSW handler missing** — add the missing API mock to `src/mocks/handlers.ts`
6. **Port conflict** — frontend tests assume port 3001, not 3000
