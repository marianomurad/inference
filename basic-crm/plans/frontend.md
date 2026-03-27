# Basic CRM — Frontend Plan

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| Server State | Tanstack Query v5 (60s polling, no WebSocket) |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Toasts | Sonner |
| Date Utilities | date-fns |
| Kanban Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| HTTP Client | ky |
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
│   │   ├── layout.tsx              ← sidebar + topbar shell
│   │   ├── page.tsx                ← dashboard overview
│   │   ├── contacts/
│   │   │   ├── page.tsx            ← contacts data table
│   │   │   └── [id]/
│   │   │       └── page.tsx        ← contact profile
│   │   ├── companies/
│   │   │   ├── page.tsx            ← companies data table
│   │   │   └── [id]/
│   │   │       └── page.tsx        ← company profile
│   │   ├── deals/
│   │   │   ├── page.tsx            ← kanban + list toggle
│   │   │   └── [id]/
│   │   │       └── page.tsx        ← deal detail
│   │   ├── activities/
│   │   │   └── page.tsx            ← activity log
│   │   ├── tasks/
│   │   │   └── page.tsx            ← tasks grouped by due date
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         ← shadcn/ui base components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx              ← includes global search trigger
│   │   └── breadcrumbs.tsx
│   ├── contacts/
│   │   ├── contact-table.tsx
│   │   ├── contact-status-badge.tsx
│   │   ├── contact-form.tsx
│   │   └── contact-profile-card.tsx
│   ├── companies/
│   │   ├── company-table.tsx
│   │   ├── company-form.tsx
│   │   └── company-profile-card.tsx
│   ├── deals/
│   │   ├── pipeline-board.tsx      ← dnd-kit kanban
│   │   ├── deal-card.tsx           ← kanban card
│   │   ├── deal-table.tsx          ← list view
│   │   ├── deal-form.tsx
│   │   └── deal-status-badge.tsx
│   ├── activities/
│   │   ├── activity-timeline.tsx   ← vertical timeline
│   │   ├── activity-form.tsx       ← log call/email/meeting/note
│   │   └── activity-type-icon.tsx
│   ├── tasks/
│   │   ├── task-list.tsx           ← grouped by overdue/today/upcoming
│   │   └── task-form.tsx
│   ├── reports/
│   │   ├── pipeline-chart.tsx      ← bar chart per stage
│   │   ├── won-lost-chart.tsx      ← trend line
│   │   └── metric-card.tsx
│   └── shared/
│       ├── global-search.tsx       ← Command palette, Cmd+K
│       ├── confirm-dialog.tsx
│       ├── empty-state.tsx
│       ├── loading-spinner.tsx
│       └── data-table.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── contacts.ts
│   │   ├── companies.ts
│   │   ├── deals.ts
│   │   ├── activities.ts
│   │   ├── tasks.ts
│   │   ├── search.ts
│   │   └── reports.ts
│   ├── hooks/
│   │   └── use-global-search.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── contact.schema.ts
│   │   ├── company.schema.ts
│   │   ├── deal.schema.ts
│   │   ├── activity.schema.ts
│   │   └── task.schema.ts
│   └── utils.ts
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
- Email + password form (RHF + Zod)
- JWT stored via Zustand auth-store (localStorage)
- Redirect to dashboard on success
- Error toast on failure

### Dashboard (`/`)
- Pipeline summary: total open deals value, count by stage (mini bar chart)
- Tasks due today (up to 5, with quick check-off)
- Recent activity feed (last 10 entries)
- Quick stats: total contacts, companies, open deals, won this month
- Auto-refreshes every 60s

### Contacts (`/contacts`)
- Data table: name, email, company, status badge, owner, last activity date
- Search input (filters table client-side + server-side)
- Filter by status, owner, tag
- Row click → contact profile
- Inline status change via dropdown
- Create contact slide-over (Sheet)

### Contact Profile (`/contacts/[id]`)
- Header card: name, email, phone, status badge, owner, linked companies
- Tabs: Overview / Activities / Deals / Tasks
- **Overview**: editable fields, tags, notes
- **Activities**: `<ActivityTimeline>` (vertical feed) + log new activity button
- **Deals**: list of linked deals with stage + value
- **Tasks**: task list + create task button

### Companies (`/companies`)
- Data table: name, industry, website, contact count, deal value
- Search + filter by industry
- Create company sheet

### Company Profile (`/companies/[id]`)
- Header: name, industry, website, employee count, revenue
- Tabs: Contacts / Deals / Activities
- **Contacts**: linked contacts table
- **Deals**: deals associated with this company
- **Activities**: all activities linked to any contact or deal of this company

### Deals (`/deals`)
- **Toggle**: Kanban board view ↔ List view (persisted in ui-store)
- **Kanban**: columns = deal stages, cards = deals (drag to move stage via dnd-kit)
  - Column header: stage name, total value, deal count
  - Card: deal title, company/contact name, value, close date, owner avatar
  - Drop triggers `PATCH /api/v1/deals/:id/stage`
- **List**: data table with sort by value/close date/stage
- Filter by owner, status (open/won/lost)
- Create deal sheet

### Deal Detail (`/deals/[id]`)
- Header: title, value, stage selector, status badge (open/won/lost), close date
- Linked contact + company (with links)
- Tabs: Activities / Tasks / Info
- **Activities**: timeline + log activity
- **Tasks**: task list + create
- **Info**: owner, created date, notes
- Won/Lost action buttons

### Activities (`/activities`)
- Filterable log of all activities
- Filter by type (call/email/meeting/note), contact, deal, date range
- Each row: type icon, subject, contact/deal link, user, date
- Log activity button (Sheet with form)

### Tasks (`/tasks`)
- Grouped by: **Overdue** (red) / **Today** (amber) / **Upcoming** (zinc)
- Each task: title, linked contact/deal, assignee, due date, check-off button
- Create task FAB
- Filter by assignee, contact, deal

### Reports (`/reports`)
- Date range picker (Week / Month / Quarter / Custom)
- **Pipeline by Stage**: horizontal bar chart (deal count + value per stage)
- **Won vs Lost Trend**: line chart over time
- **Activity Breakdown**: pie/bar by type (call/email/meeting/note)
- **Conversion Rate**: lead→customer funnel metric card
- CSV export

### Settings (`/settings`)
- Tabs: Profile / Users / Pipeline Stages / Tags
- **Pipeline Stages**: list with drag-to-reorder (dnd-kit), add/edit/delete
- **Tags**: color-coded tag manager
- **Users**: user table with role management (admin only)

---

## State Architecture

### Server State (Tanstack Query)

```ts
// lib/api/query-keys.ts
export const queryKeys = {
  contacts: (filters?: ContactFilters) => ["contacts", filters] as const,
  contact: (id: string) => ["contacts", id] as const,
  contactActivities: (id: string) => ["contacts", id, "activities"] as const,
  contactDeals: (id: string) => ["contacts", id, "deals"] as const,
  contactTasks: (id: string) => ["contacts", id, "tasks"] as const,
  companies: (filters?: CompanyFilters) => ["companies", filters] as const,
  company: (id: string) => ["companies", id] as const,
  deals: (filters?: DealFilters) => ["deals", filters] as const,
  deal: (id: string) => ["deals", id] as const,
  dealStages: () => ["deal-stages"] as const,
  activities: (filters?: ActivityFilters) => ["activities", filters] as const,
  tasks: (filters?: TaskFilters) => ["tasks", filters] as const,
  tags: () => ["tags"] as const,
  search: (q: string) => ["search", q] as const,
  reports: (params: ReportParams) => ["reports", params] as const,
  dashboard: () => ["dashboard"] as const,
}
```

Polling: all dashboard queries use `refetchInterval: 60_000`.

### Client State (Zustand)

```ts
// lib/stores/ui-store.ts
interface UIStore {
  dealsViewMode: "kanban" | "list"
  setDealsViewMode: (mode: "kanban" | "list") => void
  isGlobalSearchOpen: boolean
  openGlobalSearch: () => void
  closeGlobalSearch: () => void
  isCreateContactOpen: boolean
  setCreateContactOpen: (open: boolean) => void
  isCreateDealOpen: boolean
  setCreateDealOpen: (open: boolean) => void
}
```

### Global Search
Uses shadcn `Command` component (command palette) triggered by `Cmd+K`:
- Debounced query to `GET /api/v1/search?q=`
- Results grouped by type: Contacts / Companies / Deals
- Click result → navigate to profile page

---

## API Client

Same pattern as basic-cafe:
```ts
// lib/api/client.ts
export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1",
  hooks: {
    beforeRequest: [/* attach Bearer token */],
    afterResponse: [/* 401 → refresh token */],
  },
})
```

Note: CRM backend runs on port **8081** by default (to avoid conflict with basic-cafe on 8080).

---

## Design System

Same as basic-cafe — zinc dark theme with indigo accent:
- `bg-zinc-950` page backgrounds
- `bg-zinc-900` cards
- `border-zinc-800` borders
- `text-white` / `text-zinc-400` / `text-zinc-500`
- Indigo-600 for primary actions
- Emerald for success/won, rose for danger/lost, amber for warning/overdue

### Contact Status Colors
- `lead` → indigo
- `prospect` → amber
- `customer` → emerald
- `churned` → zinc

### Deal Status Colors
- `open` → indigo
- `won` → emerald
- `lost` → rose

### Activity Type Icons (Lucide)
- `call` → Phone
- `email` → Mail
- `meeting` → CalendarDays
- `note` → StickyNote

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
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
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Implementation Order

1. **Scaffold** — Next.js init, Tailwind + shadcn/ui, layout shell
2. **Auth** — login page, JWT store, protected routes
3. **Contacts** — table + profile + status badge + create sheet
4. **Companies** — table + profile
5. **Deals** — Kanban board (dnd-kit) + list toggle + deal detail
6. **Activities** — timeline component + log form
7. **Tasks** — grouped list + check-off
8. **Global Search** — Command palette + search API integration
9. **Reports** — pipeline chart + won/lost trend + activity breakdown
10. **Settings** — stages config (drag-to-reorder) + tags + users
11. **Polish** — animations, skeletons, empty states, error boundaries
