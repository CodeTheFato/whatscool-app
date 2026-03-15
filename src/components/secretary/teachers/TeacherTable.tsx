"use client"

import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Pencil, Trash2, Phone, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Types ───────────────────────────────────────────────
export type TeacherSortField = "name" | "classes"
export type SortDirection = "asc" | "desc"

export interface TeacherRow {
  id: string
  name: string
  email: string
  phone?: string | null
  registrationId?: string | null
  classes: string[]
  subjects: string[]
  status: string
  isActive: boolean
}

interface TeacherTableProps {
  teachers: TeacherRow[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  sortField?: TeacherSortField
  sortDirection?: SortDirection
  onSort?: (field: TeacherSortField) => void
}

// ─── Helpers ─────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50">
          Ativo
        </Badge>
      )
    case "ON_LEAVE":
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50">
          Afastado
        </Badge>
      )
    case "INACTIVE":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100">
          Inativo
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatPhone(phone: string | null | undefined) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return phone
}

// ─── WhatsApp icon ───────────────────────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────
export function TeacherTable({
  teachers,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  sortField,
  sortDirection,
  onSort,
}: TeacherTableProps) {
  const router = useRouter()
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const allSelected = teachers.length > 0 && selectedIds.length === teachers.length

  // Sort icon for column headers
  const SortIcon = ({ field }: { field: TeacherSortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />
    return sortDirection === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5" />
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 7) {
      for (let i = 1;i <= totalPages;i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("ellipsis")
      for (let i = Math.max(2, currentPage - 1);i <= Math.min(totalPages - 1, currentPage + 1);i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} professor{selectedIds.length > 1 ? "es" : ""} selecionado{selectedIds.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Excluir
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Selecionar todos" />
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
                  onClick={() => onSort?.("name")}
                >
                  Professor
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
                  onClick={() => onSort?.("classes")}
                >
                  Turmas
                  <SortIcon field="classes" />
                </button>
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Disciplinas</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">WhatsApp</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="w-12 px-4 py-3 text-right font-medium text-muted-foreground">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => {
              const phone = teacher.phone
              return (
                <tr
                  key={teacher.id}
                  className="group border-b last:border-0 transition-colors hover:bg-muted/40 cursor-pointer"
                  onClick={() => router.push(`/secretary/teachers/${teacher.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(teacher.id)}
                      onCheckedChange={() => onToggleSelect(teacher.id)}
                      aria-label={`Selecionar ${teacher.name}`}
                    />
                  </td>

                  {/* Teacher */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium leading-none">{teacher.name}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Classes */}
                  <td className="px-4 py-3">
                    {teacher.classes.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {teacher.classes.slice(0, 2).map((cls) => (
                          <Badge key={cls} variant="secondary" className="font-normal">
                            {cls}
                          </Badge>
                        ))}
                        {teacher.classes.length > 2 && (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="cursor-default font-normal text-xs">
                                  +{teacher.classes.length - 2}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <span>{teacher.classes.slice(2).join(", ")}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem turma</span>
                    )}
                  </td>

                  {/* Subjects */}
                  <td className="hidden px-4 py-3 md:table-cell">
                    {teacher.subjects.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {teacher.subjects.slice(0, 2).map((subj) => (
                          <Badge key={subj} variant="outline" className="font-normal text-xs">
                            {subj}
                          </Badge>
                        ))}
                        {teacher.subjects.length > 2 && (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="cursor-default font-normal text-xs">
                                  +{teacher.subjects.length - 2}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <span>{teacher.subjects.slice(2).join(", ")}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* WhatsApp */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {phone ? (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={`https://wa.me/55${phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <WhatsAppIcon className="h-3.5 w-3.5" />
                              <span className="text-xs">{formatPhone(phone)}</span>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Abrir no WhatsApp</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">{getStatusBadge(teacher.status)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/secretary/teachers/${teacher.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/secretary/teachers/${teacher.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {phone && (
                          <DropdownMenuItem asChild>
                            <a href={`https://wa.me/55${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <Phone className="mr-2 h-4 w-4" />
                              WhatsApp
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} de {totalItems} professores
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            {getPageNumbers().map((page, i) =>
              page === "ellipsis" ? (
                <span key={`e-${i}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
