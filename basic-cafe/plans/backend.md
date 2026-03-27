# Basic Cafe — Backend Plan

## Stack

| Layer | Technology |
|---|---|
| Language | Go 1.22+ |
| Web Framework | Fiber v2 |
| ORM | GORM v2 |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Auth | JWT (golang-jwt/jwt v5) |
| Validation | go-playground/validator v10 |
| Config | godotenv + os.Getenv |
| Hot Reload (dev) | Air |
| Testing | testify + httptest |
| Migrations | golang-migrate/migrate |
| WebSockets | Fiber built-in (gorilla/websocket under the hood) |
| Logging | zerolog |
| Containerization | Docker (alpine base) |

---

## Project Layout

```
backend/
├── cmd/
│   └── server/
│       └── main.go             ← entrypoint
├── internal/
│   ├── config/
│   │   └── config.go           ← env var loading
│   ├── database/
│   │   ├── postgres.go         ← connection setup
│   │   └── redis.go
│   ├── domain/                 ← pure types, no deps
│   │   ├── user.go
│   │   ├── product.go
│   │   ├── inventory.go
│   │   ├── table.go
│   │   ├── order.go
│   │   └── payment.go
│   ├── repository/             ← DB queries (GORM)
│   │   ├── user_repo.go
│   │   ├── product_repo.go
│   │   ├── inventory_repo.go
│   │   ├── table_repo.go
│   │   ├── order_repo.go
│   │   └── payment_repo.go
│   ├── service/                ← business logic
│   │   ├── auth_service.go
│   │   ├── product_service.go
│   │   ├── inventory_service.go
│   │   ├── table_service.go
│   │   ├── order_service.go
│   │   └── checkout_service.go
│   ├── handler/                ← HTTP handlers (thin layer)
│   │   ├── auth_handler.go
│   │   ├── product_handler.go
│   │   ├── inventory_handler.go
│   │   ├── table_handler.go
│   │   ├── order_handler.go
│   │   ├── checkout_handler.go
│   │   └── ws_handler.go       ← WebSocket hub
│   ├── middleware/
│   │   ├── auth.go             ← JWT validation
│   │   ├── rbac.go             ← role-based access
│   │   ├── logger.go
│   │   └── cors.go
│   ├── payment/
│   │   ├── provider.go         ← interface definition
│   │   ├── mock.go
│   │   ├── stripe.go           ← stubbed, ready to implement
│   │   └── mercadopago.go      ← stubbed, ready to implement
│   └── router/
│       └── router.go           ← route registration
├── migrations/
│   ├── 000001_init.up.sql
│   ├── 000001_init.down.sql
│   └── ...
├── .air.toml                   ← hot reload config
├── Dockerfile
├── go.mod
└── go.sum
```

---

## Domain Models

### User
```go
type Role string
const (
    RoleOwner   Role = "owner"
    RoleManager Role = "manager"
    RoleCashier Role = "cashier"
    RoleWaiter  Role = "waiter"
)

type User struct {
    ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
    Name         string
    Email        string    `gorm:"uniqueIndex"`
    PasswordHash string
    Role         Role
    Active       bool      `gorm:"default:true"`
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

### Product
```go
type Product struct {
    ID          uuid.UUID  `gorm:"type:uuid;primaryKey"`
    CategoryID  uuid.UUID
    Category    Category
    Name        string
    Description string
    BasePrice   int64      // stored in cents
    ImageURL    string
    Active      bool       `gorm:"default:true"`
    Variants    []ProductVariant
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type ProductVariant struct {
    ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
    ProductID uuid.UUID
    Name      string    // e.g. "Large", "Extra Shot"
    PriceDiff int64     // delta from base price in cents
}
```

### Inventory
```go
type InventoryItem struct {
    ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
    Name         string
    Unit         string    // "kg", "liters", "units"
    CurrentStock float64
    MinStock     float64   // triggers low-stock alert
    CreatedAt    time.Time
}

type StockEntry struct {
    ID              uuid.UUID `gorm:"type:uuid;primaryKey"`
    InventoryItemID uuid.UUID
    InventoryItem   InventoryItem
    Quantity        float64
    CostPerUnit     int64     // cents
    Supplier        string
    ReceivedBy      uuid.UUID // user ID
    ReceivedAt      time.Time
}
```

### Table
```go
type TableStatus string
const (
    TableAvailable  TableStatus = "available"
    TableOccupied   TableStatus = "occupied"
    TableReserved   TableStatus = "reserved"
    TableCleaning   TableStatus = "cleaning"
)

type Table struct {
    ID       uuid.UUID   `gorm:"type:uuid;primaryKey"`
    Number   int         `gorm:"uniqueIndex"`
    Capacity int
    Status   TableStatus `gorm:"default:'available'"`
    PosX     float64     // floor map X position
    PosY     float64     // floor map Y position
}
```

### Order
```go
type OrderStatus string
const (
    OrderOpen      OrderStatus = "open"
    OrderReady     OrderStatus = "ready"      // kitchen done
    OrderDelivered OrderStatus = "delivered"
    OrderPaid      OrderStatus = "paid"
    OrderCancelled OrderStatus = "cancelled"
)

type Order struct {
    ID         uuid.UUID   `gorm:"type:uuid;primaryKey"`
    TableID    *uuid.UUID  // nil for takeout
    Table      *Table
    WaiterID   uuid.UUID
    Status     OrderStatus `gorm:"default:'open'"`
    Items      []OrderItem
    Notes      string
    OpenedAt   time.Time
    ClosedAt   *time.Time
}

type OrderItem struct {
    ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
    OrderID   uuid.UUID
    ProductID uuid.UUID
    Product   Product
    VariantID *uuid.UUID
    Variant   *ProductVariant
    Quantity  int
    UnitPrice int64     // price snapshot at order time
    Notes     string
}
```

### Payment
```go
type PaymentStatus string
const (
    PaymentPending   PaymentStatus = "pending"
    PaymentCompleted PaymentStatus = "completed"
    PaymentFailed    PaymentStatus = "failed"
    PaymentRefunded  PaymentStatus = "refunded"
)

type Payment struct {
    ID           uuid.UUID     `gorm:"type:uuid;primaryKey"`
    OrderID      uuid.UUID
    Amount       int64         // total in cents
    Method       string        // "cash", "card", "qr"
    Provider     string        // "mock", "stripe", "mercadopago"
    ProviderRef  string        // external payment ID
    Status       PaymentStatus `gorm:"default:'pending'"`
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

---

## API Routes

### Auth
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Users (owner/manager only)
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Products
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/categories
POST   /api/v1/categories
```

### Inventory
```
GET    /api/v1/inventory
POST   /api/v1/inventory
GET    /api/v1/inventory/:id
PUT    /api/v1/inventory/:id
GET    /api/v1/inventory/low-stock
POST   /api/v1/inventory/:id/entries    ← stock ingress
GET    /api/v1/inventory/:id/entries    ← history
```

### Tables
```
GET    /api/v1/tables
POST   /api/v1/tables
GET    /api/v1/tables/:id
PUT    /api/v1/tables/:id
PATCH  /api/v1/tables/:id/status
DELETE /api/v1/tables/:id
```

### Orders
```
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id
PATCH  /api/v1/orders/:id/status
POST   /api/v1/orders/:id/items
DELETE /api/v1/orders/:id/items/:itemId
```

### Checkout
```
POST   /api/v1/orders/:id/checkout      ← create payment intent
POST   /api/v1/orders/:id/confirm       ← confirm payment
POST   /api/v1/payments/:id/refund
GET    /api/v1/payments/webhook         ← provider webhook
```

### Reports
```
GET    /api/v1/reports/sales            ?from=&to=
GET    /api/v1/reports/top-products     ?from=&to=&limit=
GET    /api/v1/reports/inventory-usage  ?from=&to=
```

### WebSocket
```
WS     /api/v1/ws                       ← real-time events (table status, order updates)
```

---

## Payment Provider Interface

```go
// internal/payment/provider.go
package payment

type PaymentMeta struct {
    OrderID     string
    Description string
    CustomerRef string
}

type PaymentIntent struct {
    ID          string
    ClientToken string // passed to frontend SDK
    Amount      int64
    Currency    string
}

type PaymentResult struct {
    IntentID string
    Status   string
    PaidAt   time.Time
}

type RefundResult struct {
    RefundID string
    Amount   int64
    Status   string
}

type Provider interface {
    CreateIntent(amount int64, currency string, meta PaymentMeta) (*PaymentIntent, error)
    ConfirmPayment(intentID string) (*PaymentResult, error)
    Refund(intentID string, amount int64) (*RefundResult, error)
    WebhookHandler() fiber.Handler
}
```

---

## Middleware Stack (per request)

```
Request → Logger → CORS → RateLimit → Auth (JWT) → RBAC → Handler → Response
```

RBAC rules matrix:

| Route Group | Owner | Manager | Cashier | Waiter |
|---|---|---|---|---|
| Users CRUD | ✓ | ✓ | — | — |
| Products CRUD | ✓ | ✓ | — | — |
| Inventory ingress | ✓ | ✓ | — | — |
| Tables management | ✓ | ✓ | — | — |
| Order create/update | ✓ | ✓ | ✓ | ✓ |
| Checkout | ✓ | ✓ | ✓ | — |
| Reports | ✓ | ✓ | — | — |

---

## WebSocket Events

Real-time events pushed to connected clients:

```json
{ "event": "table.status_changed", "data": { "tableId": "...", "status": "occupied" } }
{ "event": "order.created",        "data": { "orderId": "...", "tableId": "..." } }
{ "event": "order.item_added",     "data": { "orderId": "...", "item": { ... } } }
{ "event": "order.status_changed", "data": { "orderId": "...", "status": "ready" } }
{ "event": "order.paid",           "data": { "orderId": "...", "tableId": "..." } }
{ "event": "inventory.low_stock",  "data": { "itemId": "...", "name": "...", "current": 2.5 } }
```

---

## Environment Variables

```env
# Server
PORT=8080
ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/basic_cafe

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=super-secret-key
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d

# Payment
PAYMENT_PROVIDER=mock
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
```

---

## Docker

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

---

## Implementation Order

1. **Scaffold** — project init, Fiber setup, config, DB connection, migrations
2. **Auth** — user model, password hashing, JWT issue/validate, refresh tokens
3. **Products & Categories** — CRUD, validation
4. **Inventory** — items + stock ingress endpoint + low-stock query
5. **Tables** — CRUD + status updates + WebSocket broadcast
6. **Orders** — full lifecycle, order items, status machine
7. **Checkout** — mock provider end-to-end, payment record
8. **Reports** — SQL aggregate queries
9. **Provider integration** — wire in Stripe or MercadoPago when decided
10. **Testing** — integration tests per domain with real PG (testcontainers)
