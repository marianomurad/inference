"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Building2, TrendingUp } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useUIStore } from "@/lib/stores/ui-store"
import { useGlobalSearch } from "@/lib/hooks/use-global-search"
import { formatCurrency } from "@/lib/utils"

export function GlobalSearch() {
  const router = useRouter()
  const isOpen = useUIStore((s) => s.isGlobalSearchOpen)
  const open = useUIStore((s) => s.openGlobalSearch)
  const close = useUIStore((s) => s.closeGlobalSearch)
  const { query, setQuery, results, isLoading } = useGlobalSearch()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) close()
        else open()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, open, close])

  function navigate(href: string) {
    close()
    router.push(href)
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
      <CommandInput
        placeholder="Search contacts, companies, deals…"
        value={query}
        onValueChange={setQuery}
        className="border-b border-zinc-800"
      />
      <CommandList className="bg-zinc-900">
        {isLoading && <CommandEmpty>Searching…</CommandEmpty>}
        {!isLoading && query.length >= 2 && !results && <CommandEmpty>No results found.</CommandEmpty>}
        {query.length < 2 && <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>}

        {results?.contacts && results.contacts.length > 0 && (
          <CommandGroup heading="Contacts" className="text-zinc-400">
            {results.contacts.map((c) => (
              <CommandItem key={c.id} onSelect={() => navigate(`/contacts/${c.id}`)} className="gap-2">
                <Users className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-white">{c.name}</span>
                <span className="text-zinc-500 text-sm">{c.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.companies && results.companies.length > 0 && (
          <CommandGroup heading="Companies" className="text-zinc-400">
            {results.companies.map((c) => (
              <CommandItem key={c.id} onSelect={() => navigate(`/companies/${c.id}`)} className="gap-2">
                <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-white">{c.name}</span>
                {c.industry && <span className="text-zinc-500 text-sm">{c.industry}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.deals && results.deals.length > 0 && (
          <CommandGroup heading="Deals" className="text-zinc-400">
            {results.deals.map((d) => (
              <CommandItem key={d.id} onSelect={() => navigate(`/deals/${d.id}`)} className="gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-white">{d.title}</span>
                <span className="text-zinc-500 text-sm">{formatCurrency(d.value)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
