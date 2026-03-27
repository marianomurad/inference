import { create } from "zustand"
import { persist } from "zustand/middleware"
export type UserRole = "owner" | "manager" | "cashier" | "waiter"
export interface User { id: string; name: string; email: string; role: UserRole }
interface AuthStore {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  hasRole: (...roles: UserRole[]) => boolean
}
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken)
        localStorage.setItem("refresh_token", refreshToken)
        set({ user, accessToken })
      },
      clearAuth: () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        set({ user: null, accessToken: null })
      },
      hasRole: (...roles) => {
        const { user } = get()
        return user ? roles.includes(user.role) : false
      },
    }),
    { name: "auth-store", partialize: (s) => ({ user: s.user, accessToken: s.accessToken }) }
  )
)
