"use client"

import { useQuery } from "@tanstack/react-query"
import { me } from "@/lib/api/auth"
import { queryKeys } from "@/lib/api/query-keys"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const roleColors: Record<string, string> = {
  admin: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  manager: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  sales_rep: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
}

export default function SettingsPage() {
  const storeUser = useAuthStore((s) => s.user)
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: me,
    initialData: storeUser ?? undefined,
  })

  const initials = user
    ? `${user.name.split(" ")[0]?.[0] ?? ""}${user.name.split(" ")[1]?.[0] ?? ""}`.toUpperCase()
    : "?"

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-indigo-600 text-white text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-lg">{user?.name}</p>
                  <p className="text-zinc-400 text-sm">{user?.email}</p>
                  <Badge variant="outline" className={`mt-2 ${roleColors[user?.role ?? ""] ?? ""}`}>
                    {user?.role?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Pipeline Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 text-sm">Pipeline stage configuration coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 text-sm">Tag management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
