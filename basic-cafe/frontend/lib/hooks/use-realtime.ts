"use client"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useWebSocket } from "./use-websocket"
import { queryKeys } from "@/lib/api/query-keys"
export function useRealtime() {
  const queryClient = useQueryClient()
  const { on } = useWebSocket()
  useEffect(() => {
    const unsubs = [
      on("table.status_changed", () => { queryClient.invalidateQueries({ queryKey: queryKeys.tables() }); queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() }) }),
      on("order.created", () => { queryClient.invalidateQueries({ queryKey: queryKeys.orders() }); queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() }) }),
      on("order.status_changed", ({ orderId }) => { queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId as string) }); queryClient.invalidateQueries({ queryKey: queryKeys.orders() }) }),
      on("order.item_added", ({ orderId }) => { queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId as string) }) }),
      on("order.paid", () => { queryClient.invalidateQueries({ queryKey: queryKeys.orders() }); queryClient.invalidateQueries({ queryKey: queryKeys.tables() }); queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() }) }),
      on("inventory.low_stock", () => { queryClient.invalidateQueries({ queryKey: queryKeys.inventory() }); queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() }) }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [on, queryClient])
}
