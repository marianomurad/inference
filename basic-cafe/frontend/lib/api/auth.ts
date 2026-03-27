import { apiClient } from "./client"
export interface LoginRequest { email: string; password: string }
export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: { id: string; name: string; email: string; role: "owner" | "manager" | "cashier" | "waiter" }
}
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiClient.post("auth/login", { json: data }).json<AuthResponse>()
}
export async function logout(): Promise<void> {
  await apiClient.post("auth/logout").catch(() => {})
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}
export async function getMe(): Promise<AuthResponse["user"]> {
  return apiClient.get("auth/me").json<AuthResponse["user"]>()
}
