"use client"

import { Search, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useUIStore } from "@/lib/stores/ui-store"
import { logout } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumbs } from "./breadcrumbs"

export function Topbar() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const openGlobalSearch = useUIStore((s) => s.openGlobalSearch)

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // ignore
    } finally {
      clearAuth()
      router.push("/login")
      toast.success("Signed out")
    }
  }

  const initials = user
    ? `${user.name.split(" ")[0]?.[0] ?? ""}${user.name.split(" ")[1]?.[0] ?? ""}`.toUpperCase()
    : "?"

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-4 shrink-0">
      <Breadcrumbs />
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        className="text-zinc-400 hover:text-white gap-2 hidden sm:flex"
        onClick={openGlobalSearch}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search…</span>
        <kbd className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">⌘K</kbd>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-600 text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-zinc-900 border-zinc-800">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
          </div>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={handleLogout} className="text-rose-400 focus:text-rose-400">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

