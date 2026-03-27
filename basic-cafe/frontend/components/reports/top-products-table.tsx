import type { TopProduct } from "@/lib/api/reports"
import { DataTable } from "@/components/shared/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { formatCurrency } from "@/lib/utils"
const columns: ColumnDef<TopProduct>[] = [
  { accessorKey: "name", header: "Product", cell: ({ getValue }) => <span className="font-medium text-white">{getValue() as string}</span> },
  { accessorKey: "quantity", header: "Qty Sold", cell: ({ getValue }) => <span className="text-zinc-400">{getValue() as number}</span> },
  { accessorKey: "revenue", header: "Revenue", cell: ({ getValue }) => <span className="font-medium text-white">{formatCurrency(getValue() as number)}</span> },
]
export function TopProductsTable({ data }: { data: TopProduct[] }) {
  return <DataTable columns={columns} data={data} />
}
