import { apiClient } from "./client"

export type SearchResult = {
  contacts: Array<{ id: string; name: string; email: string; status: string }>
  companies: Array<{ id: string; name: string; industry?: string }>
  deals: Array<{ id: string; title: string; value: number; status: string }>
}

export async function globalSearch(q: string): Promise<SearchResult> {
  return apiClient.get("search", { searchParams: { q } }).json<SearchResult>()
}
