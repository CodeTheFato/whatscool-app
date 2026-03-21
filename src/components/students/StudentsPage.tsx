"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StudentStats } from "./StudentStats"
import { StudentFilters } from "./StudentFilters"
import { StudentTable } from "./StudentTable"
import { StudentEmptyState } from "./StudentEmptyState"
import type { StudentsConfig, StudentRow, SortField, SortDirection } from "./types"

const PAGE_SIZE = 15

interface StudentsPageProps {
  config: StudentsConfig
  initialStudents: StudentRow[]
}

export default function StudentsPage({ config, initialStudents }: StudentsPageProps) {
  const router = useRouter()
  const [students] = useState<StudentRow[]>(initialStudents)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // ── Derived data ──────────────────────────────────────
  const classOptions = useMemo(() => {
    const unique = new Map<string, string>()
    students.forEach((s) => {
      if (s.class) unique.set(s.class, s.class)
    })
    return Array.from(unique.entries()).map(([name]) => ({ id: name, name }))
  }, [students])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.registrationId.toLowerCase().includes(term) ||
        student.parents.some((p) => p.name.toLowerCase().includes(term))
      const matchesClass = classFilter === "all" || student.class === classFilter
      const matchesStatus = statusFilter === "all" || student.status === statusFilter
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, searchTerm, classFilter, statusFilter])

  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents]
    sorted.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name, "pt-BR")
          break
        case "class":
          cmp = (a.class ?? "").localeCompare(b.class ?? "", "pt-BR")
          break
        case "registrationId":
          cmp = a.registrationId.localeCompare(b.registrationId, "pt-BR", { numeric: true })
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
    return sorted
  }, [filteredStudents, sortField, sortDirection])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedStudents.slice(start, start + PAGE_SIZE)
  }, [sortedStudents, currentPage])

  const totalParents = useMemo(() => {
    const ids = new Set<string>()
    students.forEach((s) => s.parents.forEach((p) => ids.add(p.id)))
    return ids.size
  }, [students])

  // ── Handlers ──────────────────────────────────────────
  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedStudents(
      selectedStudents.length === paginatedStudents.length
        ? []
        : paginatedStudents.map((s) => s.id)
    )
  }

  const handleSort = useCallback((field: SortField) => {
    setSortDirection((prev) => (sortField === field && prev === "asc" ? "desc" : "asc"))
    setSortField(field)
  }, [sortField])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
    setSelectedStudents([])
  }, [searchTerm, classFilter, statusFilter])

  // ── Render ────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{config.pageDescription}</p>
        </div>
        {config.canCreate && (
          <div className="flex items-center gap-2">
            {config.canImport && (
              <Button
                variant="outline"
                onClick={() => router.push(`${config.basePath}/import`)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar alunos
              </Button>
            )}
            <Button onClick={() => router.push(`${config.basePath}/novo`)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar aluno
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {config.showStats && (
        <StudentStats
          totalStudents={students.length}
          totalClasses={classOptions.length}
          totalParents={totalParents}
        />
      )}

      {/* Filters */}
      <StudentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        classes={classOptions}
      />

      {/* Content */}
      {students.length === 0 ? (
        <StudentEmptyState
          basePath={config.basePath}
          canCreate={config.canCreate}
          canImport={config.canImport}
        />
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum aluno encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <StudentTable
          students={paginatedStudents}
          selectedIds={selectedStudents}
          onToggleSelect={toggleStudent}
          onToggleAll={toggleAll}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={sortedStudents.length}
          onPageChange={setCurrentPage}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          basePath={config.basePath}
          canSelect={config.canSelect}
          canEdit={config.canEdit}
        />
      )}
    </div>
  )
}
