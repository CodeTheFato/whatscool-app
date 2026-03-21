"use client"

import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Pencil, Trash2, Phone, Download } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { getInitials, formatPhone, getWhatsAppUrl } from "@/lib/utils/table-helpers"
import type { TeacherRow, TeacherSortField, SortDirection } from "./types"

// ─── Helpers ─────────────────────────────────────────────

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

// ─── Columns ─────────────────────────────────────────────

const columns: ColumnDef<TeacherRow, TeacherSortField>[] = [
  {
    id: "name",
    header: "Professor",
    sortField: "name",
    cell: (teacher) => (
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
    ),
  },
  {
    id: "classes",
    header: "Turmas",
    sortField: "classes",
    cell: (t) =>
      t.classes.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {t.classes.slice(0, 2).map((cls) => (
            <Badge key={cls} variant="secondary" className="font-normal">{cls}</Badge>
          ))}
          {t.classes.length > 2 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-default font-normal text-xs">
                    +{t.classes.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>{t.classes.slice(2).join(", ")}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Sem turma</span>
      ),
  },
  {
    id: "subjects",
    header: "Disciplinas",
    className: "hidden md:table-cell",
    cell: (t) =>
      t.subjects.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {t.subjects.slice(0, 2).map((subj) => (
            <Badge key={subj} variant="outline" className="font-normal text-xs">{subj}</Badge>
          ))}
          {t.subjects.length > 2 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-default font-normal text-xs">
                    +{t.subjects.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>{t.subjects.slice(2).join(", ")}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    id: "whatsapp",
    header: "WhatsApp",
    className: "hidden lg:table-cell",
    cell: (t) =>
      t.phone ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getWhatsAppUrl(t.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                onClick={(e) => e.stopPropagation()}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span className="text-xs">{formatPhone(t.phone)}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent>Abrir no WhatsApp</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    header: "Status",
    cell: (t) => getStatusBadge(t.status),
  },
]

// ─── Actions ─────────────────────────────────────────────

function TeacherActions({
  teacher,
  basePath,
  canEdit,
}: {
  teacher: TeacherRow
  basePath: string
  canEdit: boolean
}) {
  const router = useRouter()
  const detailPath = `${basePath}/${teacher.id}`

  return (
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
        <DropdownMenuItem onClick={() => router.push(detailPath)}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => router.push(detailPath)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        {teacher.phone && (
          <DropdownMenuItem asChild>
            <a href={getWhatsAppUrl(teacher.phone)} target="_blank" rel="noopener noreferrer">
              <Phone className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </DropdownMenuItem>
        )}
        {canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TeacherBulkActions() {
  return (
    <>
      <Button variant="outline" size="sm">
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Exportar
      </Button>
      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Excluir
      </Button>
    </>
  )
}

// ─── Main Component ──────────────────────────────────────

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
  basePath: string
  canSelect: boolean
  canEdit: boolean
}

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
  basePath,
  canSelect,
  canEdit,
}: TeacherTableProps) {
  return (
    <DataTable<TeacherRow, TeacherSortField>
      data={teachers}
      columns={columns}
      selection={
        canSelect
          ? { selectedIds, onToggleSelect, onToggleAll }
          : undefined
      }
      pagination={{
        currentPage,
        pageSize,
        totalItems,
        onPageChange,
        itemLabel: "professores",
      }}
      sort={
        onSort
          ? { sortField, sortDirection, onSort }
          : undefined
      }
      getRowHref={canEdit ? (t) => `${basePath}/${t.id}` : undefined}
      renderActions={(teacher) => (
        <TeacherActions teacher={teacher} basePath={basePath} canEdit={canEdit} />
      )}
      renderBulkActions={() => <TeacherBulkActions />}
    />
  )
}
