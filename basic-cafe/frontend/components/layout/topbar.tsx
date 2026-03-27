"use client"
import { LogOut, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/stores/auth-store"
import { logout } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
export function Topbar() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const handleLogout = async () => {
    await logout()
    clearAuth()
    router.push("/login")
    toast.success("Logged out successfully")
  }
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors outline-none">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
              {initials ?? <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{user?.name ?? "User"}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            <div className="text-sm font-medium">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
