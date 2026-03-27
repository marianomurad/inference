import { apiClient } from "./client"
import type { ContactFilters } from "./query-keys"

export type ContactStatus = "lead" | "prospect" | "customer" | "churned"

export type Contact = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyId?: string
  companyName?: string
  status: ContactStatus
  ownerId: string
  ownerName: string
  tags: string[]
  notes?: string
  lastActivityAt?: string
  createdAt: string
  updatedAt: string
}

export type CreateContactPayload = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyId?: string
  status: ContactStatus
  tags?: string[]
  notes?: string
}

export async function getContacts(filters?: ContactFilters): Promise<Contact[]> {
  const searchParams: Record<string, string> = {}
  if (filters?.status) searchParams.status = filters.status
  if (filters?.owner) searchParams.owner = filters.owner
  if (filters?.tag) searchParams.tag = filters.tag
  if (filters?.search) searchParams.search = filters.search
  return apiClient.get("contacts", { searchParams }).json<Contact[]>()
}

export async function getContact(id: string): Promise<Contact> {
  return apiClient.get(`contacts/${id}`).json<Contact>()
}

export async function createContact(payload: CreateContactPayload): Promise<Contact> {
  return apiClient.post("contacts", { json: payload }).json<Contact>()
}

export async function updateContact(id: string, payload: Partial<CreateContactPayload>): Promise<Contact> {
  return apiClient.put(`contacts/${id}`, { json: payload }).json<Contact>()
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`contacts/${id}`)
}
