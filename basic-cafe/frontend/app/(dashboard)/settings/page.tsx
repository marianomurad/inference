"use client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-foreground">Your Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium text-foreground">{user?.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium text-foreground">{user?.email}</span></div>
          <div className="flex justify-between items-center"><span className="text-muted-foreground">Role</span><Badge variant="outline" className="capitalize">{user?.role}</Badge></div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Settings className="h-4 w-4 shrink-0" />
          <span className="text-sm">User management and advanced settings are available for owners and managers.</span>
        </div>
      </Card>
    </div>
  )
}
