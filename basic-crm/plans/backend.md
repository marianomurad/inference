# Basic CRM — Backend Plan

## Stack

| Layer | Technology |
|---|---|
| Language | Go 1.22+ |
| Web Framework | Fiber v2 |
| ORM | GORM v2 |
| Database | PostgreSQL 16 |
| Cache / Sessions | Redis 7 |
| Auth | JWT (golang-jwt/jwt v5) |
| Validation | go-playground/validator v10 |
| Config | godotenv + os.Getenv |
| Hot Reload (dev) | Air |
| Testing | testify + httptest |
| Migrations | golang-migrate/migrate |
| Logging | zerolog |
| Containerization | Docker (alpine base) |

No WebSocket — polling-based frontend only.

---

## Project Layout

```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   ├── postgres.go
│   │   └── redis.go
│   ├── domain/
│   │   ├── user.go
│   │   ├── contact.go
│   │   ├── company.go
│   │   ├── deal.go
│   │   ├── activity.go
│   │   └── task.go
│   ├── repository/
│   │   ├── user_repo.go
│   │   ├── contact_repo.go
│   │   ├── company_repo.go
│   │   ├── deal_repo.go
│   │   ├── activity_repo.go
│   │   ├── task_repo.go
│   │   └── search_repo.go
│   ├── service/
│   │   ├── auth_service.go
│   │   ├── contact_service.go
│   │   ├── company_service.go
│   │   ├── deal_service.go
│   │   ├── activity_service.go
│   │   ├── task_service.go
│   │   └── search_service.go
│   ├── handler/
│   │   ├── auth_handler.go
│   │   ├── contact_handler.go
│   │   ├── company_handler.go
│   │   ├── deal_handler.go
│   │   ├── activity_handler.go
│   │   ├── task_handler.go
│   │   ├── search_handler.go
│   │   └── report_handler.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── rbac.go
│   │   ├── logger.go
│   │   └── cors.go
│   └── router/
│       └── router.go
├── migrations/
│   ├── 000001_init.up.sql
│   ├── 000001_init.down.sql
│   └── ...
├── .air.toml
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
    RoleAdmin    Role = "admin"
    RoleManager  Role = "manager"
    RoleSalesRep Role = "sales_rep"
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

### Contact
```go
type ContactStatus string
const (
    ContactLead     ContactStatus = "lead"
    ContactProspect ContactStatus = "prospect"
    ContactCustomer ContactStatus = "customer"
    ContactChurned  ContactStatus = "churned"
)

type Contact struct {
    ID        uuid.UUID     `gorm:"type:uuid;primaryKey"`
    OwnerID   uuid.UUID
    Owner     User
    FirstName string
    LastName  string
    Email     string        `gorm:"uniqueIndex"`
    Phone     string
    Status    ContactStatus `gorm:"default:'lead'"`
    Notes     string
    Tags      []Tag         `gorm:"many2many:contact_tags"`
    Companies []Company     `gorm:"many2many:contact_company"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

### Company
```go
type Company struct {
    ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
    Name          string
    Industry      string
    Website       string
    EmployeeCount int
    AnnualRevenue int64     // cents
    Notes         string
    Contacts      []Contact `gorm:"many2many:contact_company"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
}
```

### Deal Stage + Deal
```go
type DealStage struct {
    ID       uuid.UUID `gorm:"type:uuid;primaryKey"`
    Name     string
    Position int       `gorm:"uniqueIndex"`
    Color    string    // hex color for Kanban column header
}

type DealStatus string
const (
    DealOpen DealStatus = "open"
    DealWon  DealStatus = "won"
    DealLost DealStatus = "lost"
)

type Deal struct {
    ID        uuid.UUID  `gorm:"type:uuid;primaryKey"`
    Title     string
    StageID   uuid.UUID
    Stage     DealStage
    OwnerID   uuid.UUID
    Owner     User
    ContactID *uuid.UUID
    Contact   *Contact
    CompanyID *uuid.UUID
    Company   *Company
    Value     int64      // cents
    CloseDate *time.Time
    Status    DealStatus `gorm:"default:'open'"`
    Notes     string
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

### Activity
```go
type ActivityType string
const (
    ActivityCall    ActivityType = "call"
    ActivityEmail   ActivityType = "email"
    ActivityMeeting ActivityType = "meeting"
    ActivityNote    ActivityType = "note"
)

type Activity struct {
    ID          uuid.UUID    `gorm:"type:uuid;primaryKey"`
    Type        ActivityType
    Subject     string
    Body        string
    ContactID   *uuid.UUID
    Contact     *Contact
    DealID      *uuid.UUID
    Deal        *Deal
    UserID      uuid.UUID
    User        User
    OccurredAt  time.Time
    CreatedAt   time.Time
}
```

### Task
```go
type Task struct {
    ID         uuid.UUID  `gorm:"type:uuid;primaryKey"`
    Title      string
    DueDate    *time.Time
    Done       bool       `gorm:"default:false"`
    ContactID  *uuid.UUID
    Contact    *Contact
    DealID     *uuid.UUID
    Deal       *Deal
    AssigneeID uuid.UUID
    Assignee   User
    CreatedAt  time.Time
    UpdatedAt  time.Time
}
```

### Tag
```go
type Tag struct {
    ID    uuid.UUID `gorm:"type:uuid;primaryKey"`
    Name  string    `gorm:"uniqueIndex"`
    Color string
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

### Users (admin only)
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Contacts
```
GET    /api/v1/contacts           ?search=&status=&ownerId=&tagId=
POST   /api/v1/contacts
GET    /api/v1/contacts/:id
PUT    /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
GET    /api/v1/contacts/:id/activities
GET    /api/v1/contacts/:id/deals
GET    /api/v1/contacts/:id/tasks
PATCH  /api/v1/contacts/:id/status
```

### Companies
```
GET    /api/v1/companies          ?search=&industry=
POST   /api/v1/companies
GET    /api/v1/companies/:id
PUT    /api/v1/companies/:id
DELETE /api/v1/companies/:id
GET    /api/v1/companies/:id/contacts
GET    /api/v1/companies/:id/deals
```

### Deal Stages
```
GET    /api/v1/deal-stages
POST   /api/v1/deal-stages
PUT    /api/v1/deal-stages/:id
DELETE /api/v1/deal-stages/:id
PATCH  /api/v1/deal-stages/reorder    ← update positions
```

### Deals
```
GET    /api/v1/deals              ?stageId=&status=&ownerId=
POST   /api/v1/deals
GET    /api/v1/deals/:id
PUT    /api/v1/deals/:id
DELETE /api/v1/deals/:id
PATCH  /api/v1/deals/:id/stage    ← move to new stage
PATCH  /api/v1/deals/:id/status   ← won/lost
GET    /api/v1/deals/:id/activities
GET    /api/v1/deals/:id/tasks
```

### Activities
```
GET    /api/v1/activities         ?contactId=&dealId=&type=&from=&to=
POST   /api/v1/activities
GET    /api/v1/activities/:id
PUT    /api/v1/activities/:id
DELETE /api/v1/activities/:id
```

### Tasks
```
GET    /api/v1/tasks              ?assigneeId=&done=&overdue=
POST   /api/v1/tasks
GET    /api/v1/tasks/:id
PUT    /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id/done
DELETE /api/v1/tasks/:id
```

### Tags
```
GET    /api/v1/tags
POST   /api/v1/tags
DELETE /api/v1/tags/:id
```

### Search
```
GET    /api/v1/search?q=          ← full-text across contacts, companies, deals
```

### Reports
```
GET    /api/v1/reports/pipeline          ← deal count + value per stage
GET    /api/v1/reports/won-lost          ?from=&to=
GET    /api/v1/reports/activities        ?from=&to=
GET    /api/v1/reports/conversion        ← lead→customer conversion rate
```

---

## Search Implementation

PostgreSQL full-text search using `tsvector`:

```sql
-- contacts
ALTER TABLE contacts ADD COLUMN search_vec tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,''))
  ) STORED;
CREATE INDEX contacts_search_idx ON contacts USING GIN(search_vec);

-- companies
ALTER TABLE companies ADD COLUMN search_vec tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,''))) STORED;
CREATE INDEX companies_search_idx ON companies USING GIN(search_vec);

-- deals
ALTER TABLE deals ADD COLUMN search_vec tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,''))) STORED;
CREATE INDEX deals_search_idx ON deals USING GIN(search_vec);
```

Search endpoint unions all three results:
```go
type SearchResult struct {
    Type string `json:"type"` // "contact" | "company" | "deal"
    ID   string `json:"id"`
    Name string `json:"name"`
    Sub  string `json:"sub"` // email / industry / stage name
}
```

---

## RBAC Matrix

| Route Group | Admin | Manager | Sales Rep |
|---|---|---|---|
| Users CRUD | ✓ | — | — |
| Contacts CRUD | ✓ | ✓ | own only |
| Companies CRUD | ✓ | ✓ | ✓ |
| Deals CRUD | ✓ | ✓ | own only |
| Activities CRUD | ✓ | ✓ | own only |
| Tasks CRUD | ✓ | ✓ | own only |
| Deal Stages config | ✓ | ✓ | — |
| Reports | ✓ | ✓ | — |
| Search | ✓ | ✓ | ✓ |

---

## Middleware Stack

```
Request → Logger → CORS → RateLimit → Auth (JWT) → RBAC → Handler → Response
```

---

## Environment Variables

```env
# Server
PORT=8080
ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/basic_crm

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=super-secret-key
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d
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

1. **Scaffold** — project init, Fiber, config, DB connection, migrations
2. **Auth** — user model, bcrypt, JWT issue/validate, refresh
3. **Contacts** — CRUD + status lifecycle + tag linking
4. **Companies** — CRUD + contact relationship
5. **Deal Stages** — configurable stages with reorder
6. **Deals** — CRUD + stage move + won/lost
7. **Activities** — log entries linked to contacts/deals
8. **Tasks** — reminders with due dates
9. **Search** — full-text across all entities
10. **Reports** — SQL aggregates (pipeline, won/lost trend, activity counts)
11. **Testing** — integration tests per domain with testcontainers
