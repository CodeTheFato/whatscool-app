"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TeacherStats } from "@/components/secretary/teachers/TeacherStats"
import { TeacherFilters } from "@/components/secretary/teachers/TeacherFilters"
import { TeacherTable, type TeacherRow, type TeacherSortField, type SortDirection } from "@/components/secretary/teachers/TeacherTable"
import { TeacherEmptyState } from "@/components/secretary/teachers/TeacherEmptyState"
import { toast } from "sonner"

const PAGE_SIZE = 15

export default function TeachersPage() {
  const router = useRouter()
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<TeacherSortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/teachers")
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Erro ao buscar professores")
      }
      const data: TeacherRow[] = await response.json()
      setTeachers(data)
    } catch (error) {
      console.error("Error fetching teachers:", error)
      toast.error(
        error instanceof Error ? error.message : "Erro ao buscar professores"
      )
    } finally {
      setIsLoading(false)
    }
  }

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

  // Stats
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

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
    setSelectedTeachers([])
  }, [searchTerm, classFilter, statusFilter])

  // ── Loading skeleton ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-44" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Professores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os professores da escola e seus vínculos com turmas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/secretary/teachers/import")}>
            <Upload className="mr-2 h-4 w-4" />
            Importar professores
          </Button>
          <Button onClick={() => router.push("/secretary/teachers/novo")}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar professor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TeacherStats
        totalTeachers={teachers.length}
        totalClasses={totalClasses}
        totalSubjects={totalSubjects}
        isLoading={isLoading}
      />

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
        <TeacherEmptyState />
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
        />
      )}
    </div>
  )
}
