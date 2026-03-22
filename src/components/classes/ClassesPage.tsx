"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { AddClassModal } from "@/components/classes/AddClassModal"
import type { ClassesConfig, ClassItem } from "./types"

// ─── Helpers ─────────────────────────────────────────────

const SHIFT_LABELS: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
  FULL_TIME: "Integral",
}

const SHIFT_COLORS: Record<string, string> = {
  MORNING: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  AFTERNOON: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  EVENING: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  FULL_TIME: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

function getOccupancyColor(current: number, max: number) {
  const pct = (current / max) * 100
  if (pct >= 90) return "text-red-600 dark:text-red-400"
  if (pct >= 70) return "text-yellow-600 dark:text-yellow-400"
  return "text-green-600 dark:text-green-400"
}

// ─── Columns ─────────────────────────────────────────────

const classColumns: ColumnDef<ClassItem>[] = [
  {
    id: "name",
    header: "Nome",
    cell: (cls) => <div className="font-medium">{cls.name}</div>,
  },
  {
    id: "grade",
    header: "Série",
    cell: (cls) => <div className="text-sm">{cls.grade}</div>,
  },
  {
    id: "shift",
    header: "Turno",
    cell: (cls) => (
      <Badge variant="secondary" className={SHIFT_COLORS[cls.shift] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}>
        {SHIFT_LABELS[cls.shift] || cls.shift}
      </Badge>
    ),
  },
  {
    id: "academicYear",
    header: "Ano Letivo",
    cell: (cls) => <div className="text-sm">{cls.academicYear}</div>,
  },
  {
    id: "students",
    header: "Alunos",
    cell: (cls) => (
      <div className={`text-sm font-medium ${getOccupancyColor(cls.currentStudents, cls.maxStudents)}`}>
        {cls.currentStudents}/{cls.maxStudents}
      </div>
    ),
  },
  {
    id: "teacher",
    header: "Professor",
    cell: (cls) => (
      <div className="text-sm">
        {cls.teacher ? cls.teacher.name : <span className="text-muted-foreground">Não atribuído</span>}
      </div>
    ),
  },
]

// ─── Component ───────────────────────────────────────────

interface ClassesPageProps {
  config: ClassesConfig
  initialClasses: ClassItem[]
}

export default function ClassesPage({ config, initialClasses }: ClassesPageProps) {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const toggleClass = (id: string) => {
    setSelectedClasses((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedClasses(selectedClasses.length === filteredClasses.length ? [] : filteredClasses.map((c) => c.id))
  }

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = yearFilter === "all" || cls.academicYear.toString() === yearFilter
    const matchesShift = shiftFilter === "all" || cls.shift === shiftFilter
    return matchesSearch && matchesYear && matchesShift
  })

  const uniqueYears = Array.from(new Set(classes.map((c) => c.academicYear)))

  const handleClassAdded = async () => {
    setIsAddModalOpen(false)
    const response = await fetch("/api/classes")
    if (response.ok) {
      const data = await response.json()
      setClasses(data)
    }
  }

  const emptyMessage =
    searchTerm || yearFilter !== "all" || shiftFilter !== "all"
      ? "Nenhuma turma encontrada com os filtros aplicados."
      : config.canCreate
        ? "Nenhuma turma cadastrada. Clique em 'Nova Turma' para começar."
        : "Nenhuma turma vinculada."

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{config.pageTitle}</h1>
        <p className="text-muted-foreground mt-2">{config.pageDescription}</p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, série ou professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Ano Letivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os turnos</SelectItem>
                  <SelectItem value="MORNING">Manhã</SelectItem>
                  <SelectItem value="AFTERNOON">Tarde</SelectItem>
                  <SelectItem value="FULL_TIME">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.canCreate && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            )}
          </div>

          {/* Table */}
          <DataTable<ClassItem>
            data={filteredClasses}
            columns={classColumns}
            selection={
              config.canSelect
                ? { selectedIds: selectedClasses, onToggleSelect: toggleClass, onToggleAll: toggleAll }
                : undefined
            }
            emptyMessage={emptyMessage}
          />

          {/* Footer */}
          {filteredClasses.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                {selectedClasses.length > 0
                  ? `${selectedClasses.length} turma(s) selecionada(s)`
                  : `${filteredClasses.length} turma(s) encontrada(s)`}
              </div>
            </div>
          )}
        </div>
      </div>

      {config.canCreate && (
        <AddClassModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onClassAdded={handleClassAdded} />
      )}
    </main>
  )
}
