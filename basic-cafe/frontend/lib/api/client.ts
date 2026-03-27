import ky from "ky"

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export async function refreshToken(): Promise<void> {
  const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
  if (!refresh) return
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem("access_token", data.access_token)
      if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token)
    }
  } catch { /* ignore */ }
}

export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",
  hooks: {
    beforeRequest: [(request) => {
      const token = getAccessToken()
      if (token) request.headers.set("Authorization", `Bearer ${token}`)
    }],
    afterResponse: [async (_req, _opts, response) => {
      if (response.status === 401) await refreshToken()
    }],
  },
})
