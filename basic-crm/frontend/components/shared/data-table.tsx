"use client"

import {
  flexRender,
  type ColumnDef,
  type Table as TanTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData> {
  table: TanTable<TData>
  columns: ColumnDef<TData>[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData>({ table, columns, onRowClick }: DataTableProps<TData>) {
  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-zinc-800 hover:bg-transparent">
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="text-zinc-400 bg-zinc-900/50">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`border-zinc-800 ${onRowClick ? "cursor-pointer hover:bg-zinc-800/50" : "hover:bg-zinc-900/30"}`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-zinc-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-zinc-500 py-10">
                No results found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
