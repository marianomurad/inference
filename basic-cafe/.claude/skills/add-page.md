# Skill: Add Frontend Page

Scaffold a new page in the basic-cafe dashboard with all standard patterns.

## Input
- Page name and route (e.g. "Inventory Ingress" at `/inventory/ingress`)
- What the page does
- Does it have a form? (yes/no)
- Does it need real-time updates? (yes/no)
- Which roles can access it?

## Steps

1. **Page file** — create `frontend/app/(dashboard)/[route]/page.tsx`
   - Server Component by default unless needs client interactivity
   - Import feature components
   - Set metadata (title)

2. **Feature components** — create in `frontend/components/[domain]/`
   - One component per major UI section
   - Use shadcn/ui primitives — never raw HTML for UI elements
   - Use `<DataTable>` for tabular data
   - Use `<EmptyState>` for zero-data case
   - Loading: use shadcn `<Skeleton>` components

3. **API layer**
   - Add typed function(s) to `frontend/lib/api/[domain].ts`
   - Add query key(s) to `frontend/lib/api/query-keys.ts`

4. **Data fetching** — use Tanstack Query
   - `useQuery` for reads
   - `useMutation` for writes with `onSuccess` invalidation

5. **Form** (if needed)
   - Add Zod schema to `frontend/lib/schemas/[domain].schema.ts`
   - Use `useForm` with `zodResolver`
   - All fields via shadcn `FormField`
   - Success: `toast.success()` + invalidate query
   - Error: `toast.error()` with API message

6. **Real-time** (if needed)
   - Add event handler in `frontend/lib/hooks/use-realtime.ts`
   - Invalidate relevant query key on event

7. **Navigation** — add link to `frontend/components/layout/sidebar.tsx`
   - Include Lucide icon
   - Respect role visibility if route is role-restricted
