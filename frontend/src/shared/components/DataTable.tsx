import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Paginacion } from './Paginacion'

interface DataTableProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  paginar?: boolean
  tamanoPagina?: number
  buscador?: boolean
}

export function DataTable<T>({ datos, columnas, paginar = true, tamanoPagina = 10, buscador = false }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginar ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageSize: tamanoPagina } },
  })

  return (
    <div className="space-y-3">
      {buscador && (
        <Input
          placeholder="Buscar en la tabla…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
      )}
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const orden = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 font-medium ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {orden === 'asc' ? ' ▲' : orden === 'desc' ? ' ▼' : ''}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columnas.length} className="px-4 py-10 text-center text-stone-500">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginar && (
        <Paginacion
          pagina={table.getState().pagination.pageIndex}
          totalPaginas={table.getPageCount()}
          onCambiar={(p) => table.setPageIndex(p)}
        />
      )}
    </div>
  )
}
