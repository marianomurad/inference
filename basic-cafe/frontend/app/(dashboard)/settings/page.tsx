"use client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-5">
        <h2 className="mb-4 font-semibold text-white">Your Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-zinc-400">Name</span><span className="text-white">{user?.name}</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Email</span><span className="text-white">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Role</span><Badge variant="outline" className="capitalize bg-indigo-500/20 text-indigo-400 border-indigo-500/30">{user?.role}</Badge></div>
        </div>
      </Card>
      <Card className="bg-zinc-900 border-zinc-800 p-5"><div className="flex items-center gap-2 text-zinc-400"><Settings className="h-4 w-4" /><span className="text-sm">User management and advanced settings are available for owners and managers.</span></div></Card>
    </div>
  )
}
