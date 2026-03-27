# $0 Deployment Plan: basic-cafe POC

## Context

The `basic-cafe` project is a full-stack cafeteria POS app (Go/Fiber backend + Next.js frontend + PostgreSQL + Redis). The goal is to deploy it as a showcase/demo at zero cost. Reliability is secondary to cost; cold starts and single-instance constraints are acceptable trade-offs.

---

## Architecture

| Layer | Platform | Why |
|---|---|---|
| **Frontend** | **Vercel** | Native Next.js support, zero-config, instant CDN, free |
| **Backend** | **Fly.io** | Persistent VM (no spin-down), Docker-native, WebSocket-compatible, free tier = 3 VMs + 160 GB/mo |
| **PostgreSQL** | **Neon** | Free PostgreSQL 16 (matches schema), 0.5 GB, connection pooling included |
| **Redis** | **Upstash** | Free 10k req/day, native Redis protocol (`rediss://`), go-redis/v9 compatible |

**Why not alternatives:**
- Render (backend): spins down after 15 min → breaks in-memory WebSocket hub on cold start
- Railway: $5 credit depletes, then billing starts
- Supabase: PG 15 only; Neon matches PG 16 exactly

---

## Required Changes

### 1. Fix backend Dockerfile (CRITICAL)

**File**: `backend/Dockerfile`

The final stage is missing the `migrations/` folder. The binary calls `migrate.New("file://migrations", ...)` at startup — without this, migrations won't run and the database will be empty.

```dockerfile
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations   # ADD THIS
EXPOSE 8080
CMD ["./server"]
```

### 2. Environment variables only (no other code changes)

- Backend: set via `fly secrets set`
- Frontend: set as Vercel build-time env vars (baked into JS bundle at build)

---

## Deployment Steps (in order)

### Step 1 — Neon PostgreSQL

1. Create account at `neon.tech` → New Project → PostgreSQL 16
2. Copy the connection string: `postgresql://<user>:<pass>@<host>.neon.tech/basic_cafe?sslmode=require`
3. Save as `DATABASE_URL` — migrations auto-run on first backend startup

### Step 2 — Upstash Redis

1. Create account at `upstash.com` → New Redis Database
2. In **"Redis Connect"**, copy the **Native** connection string (NOT REST): `rediss://default:<pass>@<host>.upstash.io:6380`
3. Save as `REDIS_URL` — `rediss://` (double-s) enables TLS, handled automatically by `redis.ParseURL`

### Step 3 — Fly.io Backend

```bash
brew install flyctl
fly auth login

cd inference/basic-cafe/backend
fly launch --name basic-cafe-api --region iad --no-deploy
```

Set secrets:
```bash
fly secrets set \
  DATABASE_URL="postgresql://...neon.tech/basic_cafe?sslmode=require" \
  REDIS_URL="rediss://default:...@...upstash.io:6380" \
  JWT_SECRET="$(openssl rand -hex 32)" \
  ENV="production" \
  PORT="8080" \
  PAYMENT_PROVIDER="mock"

fly deploy
```

Backend URL: `https://basic-cafe-api.fly.dev`

Verify: `curl https://basic-cafe-api.fly.dev/health`

### Step 4 — Vercel Frontend

1. Push repo to GitHub
2. Import at `vercel.com` → set **Root Directory** to `inference/basic-cafe/frontend`
3. Add build-time env vars:
   ```
   NEXT_PUBLIC_API_URL=https://basic-cafe-api.fly.dev/api/v1
   NEXT_PUBLIC_WS_URL=wss://basic-cafe-api.fly.dev/api/v1/ws
   ```
4. Deploy → get URL like `https://basic-cafe.vercel.app`

---

## Environment Variables Reference

### Fly.io (backend secrets)

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://...neon.tech/basic_cafe?sslmode=require` |
| `REDIS_URL` | `rediss://default:...@...upstash.io:6380` |
| `JWT_SECRET` | `openssl rand -hex 32` output |
| `ENV` | `production` |
| `PORT` | `8080` |
| `PAYMENT_PROVIDER` | `mock` |

### Vercel (frontend build-time)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://basic-cafe-api.fly.dev/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `wss://basic-cafe-api.fly.dev/api/v1/ws` |

---

## Gotchas & Limitations

| Issue | Impact | Mitigation |
|---|---|---|
| Neon pauses after 5 min inactivity | First query has 500ms–2s delay | Run `curl https://basic-cafe-api.fly.dev/health` before demo |
| WebSocket hub is in-memory | Breaks if Fly scales to 2+ VMs | Keep `fly scale count 1` (default) |
| Upstash 10k req/day | ~115 ops/hour | More than enough for a demo session |
| `NEXT_PUBLIC_*` baked at build time | Changing backend URL requires Vercel redeploy | Not a concern for a stable POC |
| CORS already `AllowOrigins: "*"` | No CORS issues | No change needed |

---

## Verification Checklist

1. `curl https://basic-cafe-api.fly.dev/health` → `{"status":"ok"}`
2. Login at `https://basic-cafe.vercel.app` with `admin@basic.cafe` / `password123`
3. Verify seed data loaded (products and categories visible)
4. Test WebSocket: open Tables page, change a table status, confirm real-time update
