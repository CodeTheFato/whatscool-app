"use client"

import { useRouter } from "next/navigation"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getPageNumbers } from "@/lib/utils/table-helpers"

// ─── Types ───────────────────────────────────────────

export interface ColumnDef<TRow, TSortField extends string = string> {
  id: string
  header: string
  cell: (row: TRow) => React.ReactNode
  sortField?: TSortField
  className?: string
}

interface SelectionConfig {
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
}

interface PaginationConfig {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  itemLabel?: string
}

interface SortConfig<TSortField extends string> {
  sortField?: TSortField
  sortDirection?: "asc" | "desc"
  onSort: (field: TSortField) => void
}

export interface DataTableProps<
  TRow extends { id: string },
  TSortField extends string = string,
> {
  data: TRow[]
  columns: ColumnDef<TRow, TSortField>[]
  selection?: SelectionConfig
  pagination?: PaginationConfig
  sort?: SortConfig<TSortField>
  getRowHref?: (row: TRow) => string
  renderActions?: (row: TRow) => React.ReactNode
  renderBulkActions?: (selectedIds: string[]) => React.ReactNode
  emptyMessage?: React.ReactNode
}

// ─── Component ───────────────────────────────────────

export function DataTable<
  TRow extends { id: string },
  TSortField extends string = string,
>({
  data,
  columns,
  selection,
  pagination,
  sort,
  getRowHref,
  renderActions,
  renderBulkActions,
  emptyMessage,
}: DataTableProps<TRow, TSortField>) {
  const router = useRouter()

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
    : 1

  const allSelected =
    selection && data.length > 0 && selection.selectedIds.length === data.length

  const colCount =
    columns.length +
    (selection ? 1 : 0) +
    (renderActions ? 1 : 0)

  // ── Sort Icon ───────────────────────────────────────
  const SortIcon = ({ field }: { field: TSortField }) => {
    if (!sort || sort.sortField !== field)
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />
    return sort.sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5" />
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Bulk actions bar */}
      {selection && selection.selectedIds.length > 0 && renderBulkActions && (
        <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {selection.selectedIds.length} selecionado
            {selection.selectedIds.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {renderBulkActions(selection.selectedIds)}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {selection && (
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={selection.onToggleAll}
                    aria-label="Selecionar todos"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-3 text-left font-medium text-muted-foreground ${col.className ?? ""}`}
                >
                  {col.sortField && sort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
                      onClick={() => sort.onSort(col.sortField!)}
                    >
                      {col.header}
                      <SortIcon field={col.sortField} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {renderActions && (
                <th className="w-12 px-4 py-3 text-right font-medium text-muted-foreground">
                  <span className="sr-only">Ações</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center text-muted-foreground">
                  {emptyMessage ?? "Nenhum resultado encontrado."}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={`group border-b last:border-0 transition-colors hover:bg-muted/40 ${
                    getRowHref ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    getRowHref
                      ? () => router.push(getRowHref(row))
                      : undefined
                  }
                >
                  {selection && (
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selection.selectedIds.includes(row.id)}
                        onCheckedChange={() =>
                          selection.onToggleSelect(row.id)
                        }
                        aria-label="Selecionar"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={`px-4 py-3 ${col.className ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                  {renderActions && (
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {(pagination.currentPage - 1) * pagination.pageSize + 1}–
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalItems
            )}{" "}
            de {pagination.totalItems}
            {pagination.itemLabel ? ` ${pagination.itemLabel}` : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
            >
              Anterior
            </Button>
            {getPageNumbers(pagination.currentPage, totalPages).map(
              (page, i) =>
                page === "ellipsis" ? (
                  <span
                    key={`e-${i}`}
                    className="px-2 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={
                      pagination.currentPage === page ? "default" : "ghost"
                    }
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => pagination.onPageChange(page)}
                  >
                    {page}
                  </Button>
                )
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.currentPage === totalPages}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
