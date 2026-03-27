# Skill: Add Frontend Page

Scaffold a new page in the basic-crm dashboard with all standard patterns.

## Input
- Page name and route (e.g. "Contact Profile" at `/contacts/[id]`)
- What the page does
- Does it have a form? (yes/no)
- Does it have a Kanban board? (yes/no)
- Does it need real-time updates? (yes/no — use polling if yes)
- Which roles can access it?

## Steps

1. **Page file** — create `frontend/app/(dashboard)/[route]/page.tsx`
   - Server Component by default unless needs client interactivity
   - Import feature components

2. **Feature components** — create in `frontend/components/[domain]/`
   - Use shadcn/ui primitives always
   - Use `<DataTable>` for tabular data
   - Use `<ActivityTimeline>` for activity feeds
   - Use `<EmptyState>` for zero-data
   - Loading: shadcn `<Skeleton>` components

3. **API layer**
   - Add typed function(s) to `frontend/lib/api/[domain].ts`
   - Add query key(s) to `frontend/lib/api/query-keys.ts`

4. **Data fetching** — Tanstack Query
   - `useQuery` for reads (add `refetchInterval: 60_000` for live data)
   - `useMutation` for writes with `onSuccess` invalidation

5. **Form** (if needed)
   - Add Zod schema to `frontend/lib/schemas/[domain].schema.ts`
   - Use `useForm` with `zodResolver`
   - All fields via shadcn `FormField`
   - Success: `toast.success()` + invalidate query
   - Error: `toast.error()` with API message

6. **Kanban** (if needed)
   - Use `@dnd-kit/core` + `@dnd-kit/sortable`
   - On `onDragEnd`: optimistic update + mutate API + invalidate on error

7. **Navigation** — add link to `frontend/components/layout/sidebar.tsx`
   - Include Lucide icon
   - Role-gate if needed
