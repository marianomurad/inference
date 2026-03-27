import { apiClient } from "./client"
import type { ActivityFilters } from "./query-keys"

export type ActivityType = "call" | "email" | "meeting" | "note"

export type Activity = {
  id: string
  type: ActivityType
  subject: string
  body?: string
  contactId?: string
  contactName?: string
  dealId?: string
  dealTitle?: string
  userId: string
  userName: string
  occurredAt: string
  createdAt: string
}

export type CreateActivityPayload = {
  type: ActivityType
  subject: string
  body?: string
  contactId?: string
  dealId?: string
  occurredAt: string
}

export async function getActivities(filters?: ActivityFilters): Promise<Activity[]> {
  const searchParams: Record<string, string> = {}
  if (filters?.type) searchParams.type = filters.type
  if (filters?.contactId) searchParams.contactId = filters.contactId
  if (filters?.dealId) searchParams.dealId = filters.dealId
  if (filters?.from) searchParams.from = filters.from
  if (filters?.to) searchParams.to = filters.to
  return apiClient.get("activities", { searchParams }).json<Activity[]>()
}

export async function createActivity(payload: CreateActivityPayload): Promise<Activity> {
  return apiClient.post("activities", { json: payload }).json<Activity>()
}

export async function deleteActivity(id: string): Promise<void> {
  await apiClient.delete(`activities/${id}`)
}
