"use client"
import { useEffect, useRef, useCallback } from "react"
type EventHandler = (data: Record<string, unknown>) => void
export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map())
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/api/v1/ws"
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const url = token ? `${wsUrl}?token=${token}` : wsUrl
    const connect = () => {
      const ws = new WebSocket(url)
      wsRef.current = ws
      ws.onmessage = (event) => {
        try {
          const { event: eventName, data } = JSON.parse(event.data as string)
          handlersRef.current.get(eventName as string)?.forEach((h) => h(data as Record<string, unknown>))
        } catch { /* ignore */ }
      }
      ws.onclose = () => setTimeout(connect, 3000)
    }
    connect()
    return () => wsRef.current?.close()
  }, [])
  const on = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) handlersRef.current.set(event, new Set())
    handlersRef.current.get(event)!.add(handler)
    return () => { handlersRef.current.get(event)?.delete(handler) }
  }, [])
  return { on }
}
