export interface OrderFilters {
  status?: string
  waiterId?: string
  from?: string
  to?: string
}
export interface ProductFilters {
  search?: string
  categoryId?: string
  active?: boolean
}
export interface ReportParams {
  from: string
  to: string
}
export const queryKeys = {
  tables: () => ["tables"] as const,
  table: (id: string) => ["tables", id] as const,
  orders: (filters?: OrderFilters) => ["orders", filters] as const,
  order: (id: string) => ["orders", id] as const,
  products: (filters?: ProductFilters) => ["products", filters] as const,
  product: (id: string) => ["products", id] as const,
  categories: () => ["categories"] as const,
  inventory: () => ["inventory"] as const,
  inventoryItem: (id: string) => ["inventory", id] as const,
  inventoryEntries: (id: string) => ["inventory", id, "entries"] as const,
  reports: (params: ReportParams) => ["reports", params] as const,
  users: () => ["users"] as const,
  dashboard: () => ["dashboard"] as const,
}
