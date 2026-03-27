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
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950 px-3 py-4">
      <div className="mb-8 flex items-center gap-2 px-3">
        <Coffee className="h-6 w-6 text-indigo-400" />
        <span className="text-lg font-semibold text-white">Basic Cafe</span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white")}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {item.showLowStock && lowStock.length > 0 && <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">{lowStock.length}</Badge>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
