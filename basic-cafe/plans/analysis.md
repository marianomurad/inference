# Basic Cafe — Technical Analysis

## Project Overview

**basic-cafe** is a full-stack business administration application for cafeteria management. It covers product ingress, inventory, table management, order lifecycle, and checkout. It lives as an application within the `inference` monorepo.

---

## Feature Breakdown

| Domain | Capabilities |
|---|---|
| **Product Catalog** | Create/update/archive products, categories, pricing, variants (size, add-ons) |
| **Inventory** | Stock ingress (receiving), unit tracking, low-stock alerts, waste logging |
| **Tables** | Floor map, table status (available / occupied / reserved / cleaning), capacity |
| **Orders** | Create order per table or takeout, add/remove items, split orders, order status lifecycle |
| **Checkout** | Itemized bill, discounts/coupons, payment method abstraction (provider TBD), receipt generation |
| **Reporting** | Daily/weekly sales, top products, average ticket, inventory consumption |
| **Auth & Roles** | Owner, Manager, Cashier, Waiter — role-based access control |

---

## Backend Language Analysis

### Hallucination Risk Criteria
Hallucination risk is lower when:
- The language has massive, high-quality training data coverage
- The framework has opinionated conventions (less ambiguity → less guessing)
- The type system catches errors at compile time (compiler acts as a second safety net)
- The ecosystem is stable with well-established patterns (not rapidly-shifting APIs)

### Candidates

#### 1. Go (Recommended)
- **Hallucination risk: Very Low**
- Extremely explicit syntax — there are few "magic" ways to do things
- Strong static typing: the compiler refuses ambiguous code
- Error handling is explicit (`if err != nil`) — nothing is hidden
- Fiber (web framework) is modeled after Express, very well-documented
- GORM is one of the most widely trained-on Go ORMs
- Go's small surface area means less surface area for hallucination
- Compiles to a single binary — zero deployment surprises

#### 2. TypeScript / Node.js (Strong Alternative)
- **Hallucination risk: Low**
- Enormous training data (most popular language on GitHub)
- Type safety with strict mode catches many issues
- Risk: async/await edge cases, framework-specific quirks (NestJS decorators, etc.)
- Fastify / Hono are well-documented but slightly newer than Express
- Runtime type validation still needed (Zod) — extra surface area

#### 3. Python / FastAPI
- **Hallucination risk: Low-Medium**
- Largest training data overall
- FastAPI is excellent but Pydantic v2 migration introduced enough changes to cause occasional hallucinations on model syntax
- GIL limits true concurrency (mitigated by async, but adds complexity)
- Good for rapid prototyping but slower raw throughput than Go

#### 4. Rust / Axum
- **Hallucination risk: High**
- Lifetime annotations and borrow checker generate frequent hallucinations
- Excellent for performance but over-engineered for a cafeteria app
- Eliminated

### Decision: **Go + Fiber**

Go wins because:
1. Single binary deployment (no runtime, no Docker overhead beyond base image)
2. Excellent concurrency for real-time order updates via WebSockets
3. The Fiber + GORM + PostgreSQL stack is extremely well-documented and stable
4. Hallucination risk is minimal — Go is opinionated and the compiler enforces correctness
5. Performance is orders of magnitude beyond what a cafeteria needs, leaving headroom

---

## Frontend Framework Analysis

### Decision: **Next.js 15 (App Router)**

- Server Components for dashboard pages (fast initial load)
- Client Components for interactive order management and live table views
- API routes can proxy to the Go backend during development
- Strong ecosystem lock-in with Vercel but deployable anywhere

### UI Library Selection

| Library | Role |
|---|---|
| **Tailwind CSS v4** | Utility-first styling, zero unused CSS in production |
| **shadcn/ui** | Unstyled, copy-owned components — full control, no version lock |
| **Lucide React** | Icon set, consistent with shadcn/ui design language |
| **Framer Motion** | Page transitions, order card animations |
| **Tanstack Query v5** | Server state, caching, real-time polling / WebSocket sync |
| **Zustand** | Client-side UI state (active table, open modals, cart) |
| **React Hook Form + Zod** | Forms with schema validation, zero re-renders |
| **Recharts** | Reporting dashboards, built on D3 |
| **Sonner** | Toast notifications (shadcn-compatible) |
| **date-fns** | Date formatting for receipts and reports |

---

## Database Strategy

### Primary: PostgreSQL 16
- Relational integrity for orders, products, inventory
- JSON columns for flexible product metadata / add-on configs
- Row-level security for multi-role access patterns

### Cache / Sessions: Redis 7
- JWT refresh token store
- Real-time table status pub/sub
- Rate limiting

### Schema Domains
```
users           — auth, roles
products        — catalog, categories, pricing
product_variants — size/add-on options
inventory_items  — stock units, units of measure
stock_entries   — ingress records (supplier, quantity, cost, date)
tables          — floor layout, capacity, status
orders          — header (table/takeout, status, opened_at, closed_at)
order_items     — line items (product, variant, qty, price snapshot)
payments        — payment records (amount, method, provider_ref, status)
discounts       — coupons, happy hour rules
audit_log       — immutable event log for all mutations
```

---

## Payment Provider Strategy

Since the payment provider is TBD, the checkout system will use a **provider interface** (adapter pattern):

```go
type PaymentProvider interface {
    CreateIntent(amount int64, currency string, meta PaymentMeta) (*PaymentIntent, error)
    ConfirmPayment(intentID string) (*PaymentResult, error)
    Refund(intentID string, amount int64) (*RefundResult, error)
    WebhookHandler() http.HandlerFunc
}
```

Implemented providers (pluggable):
- `MockProvider` — for development/testing
- `StripeProvider` — ready to wire up
- `MercadoPagoProvider` — LATAM option

The active provider is selected via environment variable `PAYMENT_PROVIDER=stripe|mercadopago|mock`.

---

## Monorepo Structure (within `inference/`)

```
inference/
└── basic-cafe/
    ├── .claude/               ← Claude Code configuration
    ├── plans/                 ← Architecture documents (this folder)
    ├── backend/               ← Go API server
    │   ├── cmd/server/
    │   ├── internal/
    │   │   ├── domain/
    │   │   ├── handler/
    │   │   ├── middleware/
    │   │   ├── repository/
    │   │   ├── service/
    │   │   └── payment/
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
- Environment-based config (no hardcoded secrets)
- Backend exposes health endpoint at `GET /health`
- Frontend communicates with backend via `NEXT_PUBLIC_API_URL`

---

## Development Priorities

1. Auth (JWT, roles)
2. Product catalog CRUD
3. Inventory ingress
4. Table management
5. Order lifecycle
6. Checkout (mock provider first)
7. Reporting dashboard
8. Real payment provider integration
