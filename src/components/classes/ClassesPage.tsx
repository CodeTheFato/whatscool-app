"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddClassModal } from "@/components/classes/AddClassModal"
import type { ClassesConfig, ClassItem } from "./types"

interface ClassesPageProps {
  config: ClassesConfig
  initialClasses: ClassItem[]
}

const getShiftLabel = (shift: string) => {
  const shifts: Record<string, string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Noite",
    FULL_TIME: "Integral",
  }
  return shifts[shift] || shift
}

const getShiftColor = (shift: string) => {
  const colors: Record<string, string> = {
    MORNING: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    AFTERNOON: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    EVENING: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    FULL_TIME: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  }
  return colors[shift] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
}

const getOccupancyColor = (current: number, max: number) => {
  const percentage = (current / max) * 100
  if (percentage >= 90) return "text-red-600 dark:text-red-400"
  if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400"
  return "text-green-600 dark:text-green-400"
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
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {config.canSelect && (
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <Checkbox
                          checked={selectedClasses.length === filteredClasses.length && filteredClasses.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      </th>
                    )}
                    <th className="h-12 px-4 text-left align-middle font-medium">Nome</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Série</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Turno</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Ano Letivo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Alunos</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Professor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={config.canSelect ? 7 : 6} className="h-24 text-center text-muted-foreground">
                        {searchTerm || yearFilter !== "all" || shiftFilter !== "all"
                          ? "Nenhuma turma encontrada com os filtros aplicados."
                          : config.canCreate
                            ? "Nenhuma turma cadastrada. Clique em 'Nova Turma' para começar."
                            : "Nenhuma turma vinculada."}
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => (
                      <tr key={cls.id} className="border-b hover:bg-muted/50 transition-colors">
                        {config.canSelect && (
                          <td className="p-4">
                            <Checkbox
                              checked={selectedClasses.includes(cls.id)}
                              onCheckedChange={() => toggleClass(cls.id)}
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <div className="font-medium">{cls.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{cls.grade}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className={getShiftColor(cls.shift)}>
                            {getShiftLabel(cls.shift)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{cls.academicYear}</div>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm font-medium ${getOccupancyColor(cls.currentStudents, cls.maxStudents)}`}>
                            {cls.currentStudents}/{cls.maxStudents}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {cls.teacher ? cls.teacher.name : <span className="text-muted-foreground">Não atribuído</span>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
