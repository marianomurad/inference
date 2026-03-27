import { apiClient } from "./client"

export type LoginPayload = { email: string; password: string }
export type AuthResponse = { token: string; user: User }
export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "sales_rep"
  avatarUrl?: string
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiClient.post("auth/login", { json: payload }).json<AuthResponse>()
}

export async function logout(): Promise<void> {
  await apiClient.post("auth/logout")
}

export async function me(): Promise<User> {
  return apiClient.get("auth/me").json<User>()
}
