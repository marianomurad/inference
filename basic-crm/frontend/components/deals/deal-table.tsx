"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { DealStatusBadge } from "./deal-status-badge"
import type { Deal } from "@/lib/api/deals"
import { formatCurrency, formatDate } from "@/lib/utils"

const columns: ColumnDef<Deal>[] = [
  { accessorKey: "title", header: "Deal", cell: ({ getValue }) => <span className="font-medium text-white">{String(getValue())}</span> },
  { accessorKey: "stageName", header: "Stage", cell: ({ getValue }) => <span className="text-zinc-300">{String(getValue())}</span> },
  { accessorKey: "companyName", header: "Company", cell: ({ getValue }) => <span className="text-zinc-400">{String(getValue() ?? "—")}</span> },
  { accessorKey: "value", header: "Value", cell: ({ getValue }) => <span className="text-emerald-400 font-medium">{formatCurrency(Number(getValue()))}</span> },
  {
    accessorKey: "closeDate",
    header: "Close Date",
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined
      return <span className="text-zinc-400">{v ? formatDate(v) : "—"}</span>
    },
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <DealStatusBadge status={row.original.status} /> },
  { accessorKey: "ownerName", header: "Owner", cell: ({ getValue }) => <span className="text-zinc-400">{String(getValue())}</span> },
]

export function DealTable({ data }: { data: Deal[] }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })
  return <DataTable table={table} columns={columns} onRowClick={(row) => router.push(`/deals/${row.id}`)} />
}
