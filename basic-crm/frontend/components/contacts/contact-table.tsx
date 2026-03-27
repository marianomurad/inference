"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { DataTable } from "@/components/shared/data-table"
import { ContactStatusBadge } from "./contact-status-badge"
import type { Contact } from "@/lib/api/contacts"
import { formatRelativeTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const columns: ColumnDef<Contact>[] = [
  {
    accessorFn: (r) => `${r.firstName} ${r.lastName}`,
    id: "name",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="text-zinc-400 -ml-2 h-8" onClick={() => column.toggleSorting()}>
        Name <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-white">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-zinc-400">{String(getValue())}</span> },
  { accessorKey: "companyName", header: "Company", cell: ({ getValue }) => <span className="text-zinc-300">{String(getValue() ?? "—")}</span> },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <ContactStatusBadge status={row.original.status} />,
  },
  { accessorKey: "ownerName", header: "Owner", cell: ({ getValue }) => <span className="text-zinc-400">{String(getValue())}</span> },
  {
    accessorKey: "lastActivityAt",
    header: "Last Activity",
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined
      return <span className="text-zinc-500">{v ? formatRelativeTime(v) : "—"}</span>
    },
  },
]

export function ContactTable({ data }: { data: Contact[] }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  return (
    <DataTable
      table={table}
      columns={columns}
      onRowClick={(row) => router.push(`/contacts/${row.id}`)}
    />
  )
}
