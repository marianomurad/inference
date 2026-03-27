# Basic Cafe — Frontend Plan

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| Server State | Tanstack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Toasts | Sonner |
| Date Utilities | date-fns |
| WebSockets | native WebSocket API (custom hook) |
| HTTP Client | ky (tiny, fetch-based, typed) |
| Containerization | Docker (node:20-alpine) |

---

## Project Layout

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← sidebar + topbar shell
│   │   ├── page.tsx            ← dashboard overview
│   │   ├── tables/
│   │   │   └── page.tsx        ← floor map view
│   │   ├── orders/
│   │   │   ├── page.tsx        ← orders list
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← order detail + live edit
│   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx        ← stock levels
│   │   │   └── ingress/
│   │   │       └── page.tsx    ← stock receiving form
│   │   ├── checkout/
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx        ← users, roles
│   ├── api/                    ← Next.js route handlers (proxy / auth helpers)
│   │   └── auth/
│   │       └── [...nextauth]/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                     ← shadcn/ui base components (auto-generated)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── breadcrumbs.tsx
│   ├── tables/
│   │   ├── floor-map.tsx       ← drag-and-drop table layout
│   │   ├── table-card.tsx
│   │   └── table-status-badge.tsx
│   ├── orders/
│   │   ├── order-card.tsx
│   │   ├── order-item-row.tsx
│   │   ├── add-item-sheet.tsx  ← product picker slide-over
│   │   └── order-status-badge.tsx
│   ├── products/
│   │   ├── product-grid.tsx
│   │   ├── product-form.tsx
│   │   └── category-filter.tsx
│   ├── inventory/
│   │   ├── stock-table.tsx
│   │   ├── low-stock-alert.tsx
│   │   └── ingress-form.tsx
│   ├── checkout/
│   │   ├── bill-summary.tsx
│   │   ├── payment-method-selector.tsx
│   │   └── receipt-preview.tsx
│   ├── reports/
│   │   ├── sales-chart.tsx
│   │   ├── top-products-table.tsx
│   │   └── metric-card.tsx
│   └── shared/
│       ├── confirm-dialog.tsx
│       ├── empty-state.tsx
│       ├── loading-spinner.tsx
│       └── data-table.tsx      ← generic TanStack Table wrapper
├── lib/
│   ├── api/
│   │   ├── client.ts           ← ky instance with base URL + auth headers
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── inventory.ts
│   │   ├── tables.ts
│   │   ├── orders.ts
│   │   ├── checkout.ts
│   │   └── reports.ts
│   ├── hooks/
│   │   ├── use-websocket.ts    ← ws connection + event subscription
│   │   ├── use-tables.ts
│   │   ├── use-orders.ts
│   │   └── use-realtime.ts     ← dispatches ws events to query cache
│   ├── stores/
│   │   ├── auth-store.ts       ← current user, token
│   │   └── ui-store.ts         ← active table, open sheets, cart draft
│   ├── schemas/                ← Zod schemas (shared with forms)
│   │   ├── product.schema.ts
│   │   ├── inventory.schema.ts
│   │   ├── order.schema.ts
│   │   └── auth.schema.ts
│   └── utils.ts                ← cn(), formatCurrency(), formatDate()
├── public/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile
└── package.json
```

---

## Pages & Features

### Login (`/login`)
- Email + password form (React Hook Form + Zod)
- JWT stored in httpOnly cookie via API route
- Redirect to dashboard on success
- Error toast on failure

### Dashboard (`/`)
- Metric cards: open orders, revenue today, available tables, low-stock alerts
- Recent orders list (last 10)
- Quick-action buttons: New Order, View Tables
- Auto-refreshes every 30s via Tanstack Query

### Floor Map (`/tables`)
- Visual grid of table cards (color-coded by status)
  - Green = available, Orange = occupied, Blue = reserved, Gray = cleaning
- Click occupied table → opens order side panel
- Click available table → one-click to create a new order
- Real-time status updates via WebSocket (no page refresh needed)
- Table status can be changed via dropdown per card

### Orders (`/orders`)
- Filterable list: status, waiter, date range
- Order card: table number, status badge, item count, total, elapsed time
- `/orders/[id]` — full order detail:
  - Item list with quantity controls
  - Add items via slide-over sheet (searchable product grid)
  - Remove items with confirmation
  - Order notes
  - Status progression buttons (Open → Ready → Delivered → checkout)
  - Real-time item updates via WebSocket

### Add Item Sheet (slide-over)
- Categorized product grid with images
- Variant selector (size, add-ons)
- Quantity picker
- Notes per item
- Add to order CTA

### Products (`/products`)
- Data table with search + category filter
- Create / Edit product form:
  - Name, description, category, base price, image upload
  - Variants manager (name + price delta)
  - Toggle active/inactive
- Inline category management

### Inventory (`/inventory`)
- Stock table: item, unit, current stock, min stock, status indicator
- Low-stock row highlighted in amber
- Low-stock count badge in sidebar nav
- `/inventory/ingress` — receiving form:
  - Select inventory item
  - Quantity received, cost per unit, supplier, date
  - Notes
  - Submit logs a StockEntry and updates CurrentStock

### Checkout (`/checkout/[orderId]`)
- Itemized bill with price snapshot
- Discount / coupon code input
- Payment method selector (Cash / Card / QR — extensible)
- Subtotal / tax / total breakdown
- Confirm payment → triggers backend checkout flow
- Success state shows receipt preview with print option
- On payment completion: order status → paid, table status → cleaning

### Reports (`/reports`)
- Date range picker (Today / Week / Month / Custom)
- Metric cards: total revenue, orders, avg ticket, top category
- Line chart: revenue over time
- Bar chart: orders per hour (heatmap style)
- Top products table with revenue + quantity
- Inventory consumption table
- CSV export button

### Settings (`/settings`)
- User management table (owner/manager only)
- Invite new user form
- Role assignment
- Profile settings (own account)

---

## State Architecture

### Server State (Tanstack Query)
All backend data goes through Tanstack Query. Query keys are structured for precise invalidation:

```ts
// lib/api/query-keys.ts
export const queryKeys = {
  tables: () => ['tables'],
  table: (id: string) => ['tables', id],
  orders: (filters?: OrderFilters) => ['orders', filters],
  order: (id: string) => ['orders', id],
  products: (filters?: ProductFilters) => ['products', filters],
  inventory: () => ['inventory'],
  reports: (params: ReportParams) => ['reports', params],
}
```

### Client State (Zustand)
Only ephemeral UI state — nothing that the server owns:

```ts
// lib/stores/ui-store.ts
interface UIStore {
  activeTableId: string | null
  setActiveTable: (id: string | null) => void
  isAddItemSheetOpen: boolean
  openAddItemSheet: () => void
  closeAddItemSheet: () => void
  orderDraft: OrderDraftItem[]
  addDraftItem: (item: OrderDraftItem) => void
  removeDraftItem: (id: string) => void
  clearDraft: () => void
}
```

### Real-time Sync
WebSocket events invalidate specific query keys so Tanstack Query re-fetches automatically:

```ts
// lib/hooks/use-realtime.ts
function useRealtime() {
  const queryClient = useQueryClient()
  const { on } = useWebSocket()

  useEffect(() => {
    on('table.status_changed', ({ tableId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables() })
    })
    on('order.status_changed', ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) })
    })
    on('order.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() })
    })
    on('inventory.low_stock', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory() })
    })
  }, [on, queryClient])
}
```

---

## API Client

```ts
// lib/api/client.ts
import ky from 'ky'

export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      request => {
        const token = getAccessToken() // from cookie/store
        if (token) request.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
    afterResponse: [
      async (_req, _opts, response) => {
        if (response.status === 401) {
          await refreshToken()
          // ky will retry automatically
        }
      },
    ],
  },
})
```

---

## Design System

### Color Palette (Tailwind config)
- **Brand**: indigo-600 (primary actions)
- **Success**: emerald-500 (available, paid)
- **Warning**: amber-500 (low stock, reserved)
- **Danger**: rose-500 (cancelled, errors)
- **Neutral**: zinc-* (backgrounds, borders, text)

### Typography
- Font: Geist Sans (Next.js default, clean and modern)
- Mono: Geist Mono (prices, codes, IDs)

### Component Conventions
- All shadcn/ui components live in `components/ui/` (owned, not from node_modules)
- Custom components wrap shadcn primitives, never re-implement them
- Motion: page transitions use `framer-motion` `AnimatePresence` with fade+slide
- Tables: generic `<DataTable>` built on TanStack Table v8
- Modals: shadcn `Dialog` for confirmations, `Sheet` for side panels

### Responsive Strategy
- Primary target: tablet landscape (1024px) — POS terminal use case
- Secondary: desktop (1280px+) — manager/owner reporting
- Mobile (375px): read-only views and order status (waiters checking their orders)
- NOT optimized for mobile-first ordering — that's a separate consumer app

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/v1/ws
```

---

## Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Implementation Order

1. **Project scaffold** — Next.js init, Tailwind + shadcn/ui setup, layout shell
2. **Auth** — login page, token management, protected routes
3. **Products** — list + form (foundational data, needed by orders)
4. **Tables** — floor map + status management + WebSocket hook skeleton
5. **Orders** — list, detail, add-item sheet, status flow
6. **Inventory** — stock table + ingress form
7. **Checkout** — bill summary, payment method selector, confirmation flow
8. **Reports** — charts, metrics, date range filtering
9. **Settings** — user management
10. **Polish** — animations, empty states, error boundaries, loading skeletons
