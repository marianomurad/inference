"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
const labelMap: Record<string, string> = { dashboard: "Dashboard", tables: "Tables", orders: "Orders", products: "Products", inventory: "Inventory", ingress: "Stock Ingress", checkout: "Checkout", reports: "Reports", settings: "Settings" }
export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return null
  return (
    <nav className="flex items-center gap-1 text-sm text-zinc-400">
      <Link href="/dashboard" className="hover:text-white transition-colors">Home</Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = labelMap[seg] ?? seg
        const isLast = i === segments.length - 1
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? <span className="text-white font-medium">{label}</span> : <Link href={href} className="hover:text-white transition-colors">{label}</Link>}
          </span>
        )
      })}
    </nav>
  )
}
