"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TeacherStats } from "./TeacherStats"
import { TeacherFilters } from "./TeacherFilters"
import { TeacherTable } from "./TeacherTable"
import { TeacherEmptyState } from "./TeacherEmptyState"
import type { TeachersConfig, TeacherRow, TeacherSortField, SortDirection } from "./types"

const PAGE_SIZE = 15

interface TeachersPageProps {
  config: TeachersConfig
  initialTeachers: TeacherRow[]
}

export default function TeachersPage({ config, initialTeachers }: TeachersPageProps) {
  const router = useRouter()
  const [teachers] = useState<TeacherRow[]>(initialTeachers)
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<TeacherSortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // ── Derived data ──────────────────────────────────────
  const classOptions = useMemo(() => {
    const unique = new Set<string>()
    teachers.forEach((t) => t.classes.forEach((c) => unique.add(c)))
    return Array.from(unique).sort().map((name) => ({ id: name, name }))
  }, [teachers])

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        !term ||
        teacher.name.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term) ||
        teacher.classes.some((c) => c.toLowerCase().includes(term)) ||
        teacher.subjects.some((s) => s.toLowerCase().includes(term))
      const matchesClass = classFilter === "all" || teacher.classes.includes(classFilter)
      const matchesStatus = statusFilter === "all" || teacher.status === statusFilter
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [teachers, searchTerm, classFilter, statusFilter])

  const sortedTeachers = useMemo(() => {
    const sorted = [...filteredTeachers]
    sorted.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name, "pt-BR")
          break
        case "classes":
          cmp = a.classes.length - b.classes.length
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
    return sorted
  }, [filteredTeachers, sortField, sortDirection])

  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedTeachers.slice(start, start + PAGE_SIZE)
  }, [sortedTeachers, currentPage])

  const totalClasses = useMemo(() => {
    const unique = new Set<string>()
    teachers.forEach((t) => t.classes.forEach((c) => unique.add(c)))
    return unique.size
  }, [teachers])

  const totalSubjects = useMemo(() => {
    const unique = new Set<string>()
    teachers.forEach((t) => t.subjects.forEach((s) => unique.add(s)))
    return unique.size
  }, [teachers])

  // ── Handlers ──────────────────────────────────────────
  const toggleTeacher = (id: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedTeachers(
      selectedTeachers.length === paginatedTeachers.length
        ? []
        : paginatedTeachers.map((t) => t.id)
    )
  }

  const handleSort = useCallback((field: TeacherSortField) => {
    setSortDirection((prev) => (sortField === field && prev === "asc" ? "desc" : "asc"))
    setSortField(field)
  }, [sortField])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedTeachers([])
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
                Importar professores
              </Button>
            )}
            <Button onClick={() => router.push(`${config.basePath}/novo`)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar professor
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {config.showStats && (
        <TeacherStats
          totalTeachers={teachers.length}
          totalClasses={totalClasses}
          totalSubjects={totalSubjects}
        />
      )}

      {/* Filters */}
      <TeacherFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        classes={classOptions}
      />

      {/* Content */}
      {teachers.length === 0 ? (
        <TeacherEmptyState
          basePath={config.basePath}
          canCreate={config.canCreate}
          canImport={config.canImport}
        />
      ) : filteredTeachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum professor encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <TeacherTable
          teachers={paginatedTeachers}
          selectedIds={selectedTeachers}
          onToggleSelect={toggleTeacher}
          onToggleAll={toggleAll}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={sortedTeachers.length}
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
