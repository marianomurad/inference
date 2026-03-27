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
import type { Company } from "@/lib/api/companies"
import { formatCurrency } from "@/lib/utils"

const columns: ColumnDef<Company>[] = [
  { accessorKey: "name", header: "Company", cell: ({ getValue }) => <span className="font-medium text-white">{String(getValue())}</span> },
  { accessorKey: "industry", header: "Industry", cell: ({ getValue }) => <span className="text-zinc-400">{String(getValue() ?? "—")}</span> },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined
      return v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm truncate">{v}</a> : <span className="text-zinc-500">—</span>
    },
  },
  { accessorKey: "contactCount", header: "Contacts", cell: ({ getValue }) => <span className="text-zinc-300">{String(getValue())}</span> },
  { accessorKey: "dealValue", header: "Deal Value", cell: ({ getValue }) => <span className="text-emerald-400">{formatCurrency(Number(getValue()))}</span> },
]

export function CompanyTable({ data }: { data: Company[] }) {
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

  return <DataTable table={table} columns={columns} onRowClick={(row) => router.push(`/companies/${row.id}`)} />
}
