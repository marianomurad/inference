"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Grid3X3, ClipboardList, Package, Boxes, BarChart3, Settings, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getLowStock } from "@/lib/api/inventory"
import { Badge } from "@/components/ui/badge"
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tables", label: "Tables", icon: Grid3X3 },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Boxes, showLowStock: true },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]
export function Sidebar() {
  const pathname = usePathname()
  const { data: lowStock = [] } = useQuery({ queryKey: queryKeys.inventory(), queryFn: getLowStock, refetchInterval: 60_000 })
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-background px-3 py-5">
      <div className="mb-8 flex items-center gap-2.5 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <Coffee className="h-4 w-4 text-accent-foreground" />
        </div>
        <span className="text-base font-semibold text-foreground tracking-tight">Basic Cafe</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {item.showLowStock && lowStock.length > 0 && (
                <Badge className="ml-auto h-5 text-xs px-1.5 bg-accent text-accent-foreground border-0 hover:bg-accent">{lowStock.length}</Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
