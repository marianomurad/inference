# Skill: Run Tests

Run the test suite and interpret results for basic-cafe.

## Backend Tests

```bash
cd backend

# Run all tests
go test ./...

# Run tests with verbose output
go test -v ./...

# Run tests for a specific package
go test -v ./internal/service/...
go test -v ./internal/handler/...

# Run a specific test
go test -v -run TestOrderService_CreateOrder ./internal/service/

# Run with race detector
go test -race ./...

# Run with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Test Conventions (Backend)
- Integration tests use `testcontainers-go` to spin up a real PostgreSQL instance
- Unit tests mock at the repository interface level
- Test files live alongside the code they test: `order_service_test.go`
- Test helpers in `internal/testutil/`

## Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# E2E (Playwright)
npm run test:e2e
```

### Test Conventions (Frontend)
- Component tests: React Testing Library
- Hook tests: renderHook from Testing Library
- API mocks: MSW (Mock Service Worker)
- E2E: Playwright against running dev server

## Interpreting Failures

1. **Go compilation errors** — fix type errors first, they block all tests
2. **DB connection failures in tests** — check testcontainers setup, Docker must be running
3. **JWT/auth failures** — check test token generation in `testutil/`
4. **React act() warnings** — wrap state updates in `act()`, usually async mutation callbacks
5. **MSW handler missing** — add the missing API mock to test setup
