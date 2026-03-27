export type ContactFilters = {
  status?: string
  owner?: string
  tag?: string
  search?: string
}
export type CompanyFilters = { industry?: string; search?: string }
export type DealFilters = { owner?: string; status?: string; stage?: string }
export type ActivityFilters = {
  type?: string
  contactId?: string
  dealId?: string
  from?: string
  to?: string
}
export type TaskFilters = {
  assigneeId?: string
  contactId?: string
  dealId?: string
  done?: boolean
}
export type ReportParams = { range: string; from?: string; to?: string }

export const queryKeys = {
  contacts: (filters?: ContactFilters) => ["contacts", filters] as const,
  contact: (id: string) => ["contacts", id] as const,
  contactActivities: (id: string) => ["contacts", id, "activities"] as const,
  contactDeals: (id: string) => ["contacts", id, "deals"] as const,
  contactTasks: (id: string) => ["contacts", id, "tasks"] as const,
  companies: (filters?: CompanyFilters) => ["companies", filters] as const,
  company: (id: string) => ["companies", id] as const,
  companyContacts: (id: string) => ["companies", id, "contacts"] as const,
  companyDeals: (id: string) => ["companies", id, "deals"] as const,
  deals: (filters?: DealFilters) => ["deals", filters] as const,
  deal: (id: string) => ["deals", id] as const,
  dealStages: () => ["deal-stages"] as const,
  activities: (filters?: ActivityFilters) => ["activities", filters] as const,
  tasks: (filters?: TaskFilters) => ["tasks", filters] as const,
  tags: () => ["tags"] as const,
  users: () => ["users"] as const,
  search: (q: string) => ["search", q] as const,
  reports: (params: ReportParams) => ["reports", params] as const,
  dashboard: () => ["dashboard"] as const,
}
