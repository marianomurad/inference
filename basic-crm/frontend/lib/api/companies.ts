import { apiClient } from "./client"
import type { CompanyFilters } from "./query-keys"

export type Company = {
  id: string
  name: string
  industry?: string
  website?: string
  employeeCount?: number
  annualRevenue?: number
  contactCount: number
  dealValue: number
  createdAt: string
  updatedAt: string
}

export type CreateCompanyPayload = {
  name: string
  industry?: string
  website?: string
  employeeCount?: number
  annualRevenue?: number
}

export async function getCompanies(filters?: CompanyFilters): Promise<Company[]> {
  const searchParams: Record<string, string> = {}
  if (filters?.industry) searchParams.industry = filters.industry
  if (filters?.search) searchParams.search = filters.search
  return apiClient.get("companies", { searchParams }).json<Company[]>()
}

export async function getCompany(id: string): Promise<Company> {
  return apiClient.get(`companies/${id}`).json<Company>()
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  return apiClient.post("companies", { json: payload }).json<Company>()
}

export async function updateCompany(id: string, payload: Partial<CreateCompanyPayload>): Promise<Company> {
  return apiClient.put(`companies/${id}`, { json: payload }).json<Company>()
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`companies/${id}`)
}
