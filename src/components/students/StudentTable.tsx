"use client"

import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Pencil, Trash2, Phone, Download, FolderInput } from "lucide-react"
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
import type { StudentRow, SortField, SortDirection } from "./types"

// ─── Helpers ─────────────────────────────────────────────

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    ACTIVE: { label: "Ativo", variant: "default" },
    INACTIVE: { label: "Inativo", variant: "secondary" },
    TRANSFERRED: { label: "Transferido", variant: "outline" },
    GRADUATED: { label: "Formado", variant: "secondary" },
  }
  const info = map[status] ?? { label: status, variant: "outline" as const }
  return (
    <Badge variant={info.variant} className={status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-100" : ""}>
      {info.label}
    </Badge>
  )
}

// ─── Columns ─────────────────────────────────────────────

const columns: ColumnDef<StudentRow, SortField>[] = [
  {
    id: "name",
    header: "Aluno",
    sortField: "name",
    cell: (student) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium leading-none">{student.name}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{student.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: "class",
    header: "Turma",
    sortField: "class",
    cell: (s) =>
      s.class ? (
        <Badge variant="secondary" className="font-normal">{s.class}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Sem turma</span>
      ),
  },
  {
    id: "registrationId",
    header: "Matrícula",
    sortField: "registrationId",
    className: "hidden md:table-cell",
    cell: (s) => (
      <span className="font-mono text-xs text-muted-foreground">{s.registrationId}</span>
    ),
  },
  {
    id: "parent",
    header: "Responsável",
    className: "hidden lg:table-cell",
    cell: (s) => {
      const parent = s.parents[0]
      return parent ? (
        <div className="min-w-0">
          <p className="truncate text-sm">{parent.name}</p>
          <p className="truncate text-xs text-muted-foreground capitalize">{parent.kinship}</p>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )
    },
  },
  {
    id: "whatsapp",
    header: "WhatsApp",
    className: "hidden lg:table-cell",
    cell: (s) => {
      const phone = s.parents[0]?.phone || s.phone
      return phone ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getWhatsAppUrl(phone)}
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
      )
    },
  },
  {
    id: "status",
    header: "Status",
    cell: (s) => getStatusBadge(s.status),
  },
]

// ─── Actions ─────────────────────────────────────────────

function StudentActions({
  student,
  basePath,
  canEdit,
}: {
  student: StudentRow
  basePath: string
  canEdit: boolean
}) {
  const router = useRouter()
  const phone = student.parents[0]?.phone || student.phone
  const detailPath = `${basePath}/${student.id}`

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
        {phone && (
          <DropdownMenuItem asChild>
            <a href={getWhatsAppUrl(phone)} target="_blank" rel="noopener noreferrer">
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

function StudentBulkActions() {
  return (
    <>
      <Button variant="outline" size="sm">
        <FolderInput className="mr-1.5 h-3.5 w-3.5" />
        Mover para turma
      </Button>
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

interface StudentTableProps {
  students: StudentRow[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  sortField?: SortField
  sortDirection?: SortDirection
  onSort?: (field: SortField) => void
  basePath: string
  canSelect: boolean
  canEdit: boolean
}

export function StudentTable({
  students,
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
}: StudentTableProps) {
  return (
    <DataTable<StudentRow, SortField>
      data={students}
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
        itemLabel: "alunos",
      }}
      sort={
        onSort
          ? { sortField, sortDirection, onSort }
          : undefined
      }
      getRowHref={canEdit ? (s) => `${basePath}/${s.id}` : undefined}
      renderActions={(student) => (
        <StudentActions student={student} basePath={basePath} canEdit={canEdit} />
      )}
      renderBulkActions={() => <StudentBulkActions />}
    />
  )
}
