"use client"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useRealtime } from "@/lib/hooks/use-realtime"
function RealtimeProvider() { useRealtime(); return null }
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  useEffect(() => { if (!user) router.push("/login") }, [user, router])
  if (!user) return null
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <RealtimeProvider />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6"><div className="mb-4"><Breadcrumbs /></div>{children}</main>
      </div>
    </div>
  )
}
