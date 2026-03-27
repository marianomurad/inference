import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { globalSearch } from "@/lib/api/search"
import { queryKeys } from "@/lib/api/query-keys"

export function useGlobalSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.search(debouncedQuery),
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  return { query, setQuery, results: data, isLoading }
}
