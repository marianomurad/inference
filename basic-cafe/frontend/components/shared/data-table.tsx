"use client"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState, type ColumnFiltersState } from "@tanstack/react-table"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
interface DataTableProps<TData, TValue> { columns: ColumnDef<TData, TValue>[]; data: TData[]; searchKey?: string; searchPlaceholder?: string }
export function DataTable<TData, TValue>({ columns, data, searchKey, searchPlaceholder = "Search..." }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, state: { sorting, columnFilters }, initialState: { pagination: { pageSize: 20 } } })
  return (
    <div className="space-y-4">
      {searchKey && <Input placeholder={searchPlaceholder} value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""} onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)} className="max-w-sm" />}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id} className="border-zinc-800">{hg.headers.map((h) => (<TableHead key={h.id} className="text-zinc-400">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => (<TableRow key={row.id} className="border-zinc-800 hover:bg-zinc-800/50">{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>)) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">No results.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-zinc-500">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}
