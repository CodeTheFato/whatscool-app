"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AddClassModal } from "@/components/secretary/classes/AddClassModal"

interface Class {
  id: string
  name: string
  grade: string
  shift: string
  academicYear: number
  maxStudents: number
  currentStudents: number
  teacher: {
    id: string
    name: string
  } | null
  createdAt: string
}

export default function SecretariaTurmasPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleClass = (id: string) => {
    setSelectedClasses((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedClasses(selectedClasses.length === classes.length ? [] : classes.map((c) => c.id))
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

  const handleClassAdded = () => {
    fetchClasses()
    setIsAddModalOpen(false)
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground mt-2">Gerenciar turmas e horários escolares</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Turmas</h1>
        <p className="text-muted-foreground mt-2">Gerenciar turmas e horários escolares</p>
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
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Turma
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      <Checkbox
                        checked={selectedClasses.length === filteredClasses.length && filteredClasses.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
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
                      <td colSpan={7} className="h-24 text-center text-muted-foreground">
                        {searchTerm || yearFilter !== "all" || shiftFilter !== "all"
                          ? "Nenhuma turma encontrada com os filtros aplicados."
                          : "Nenhuma turma cadastrada. Clique em 'Nova Turma' para começar."}
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => (
                      <tr key={cls.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedClasses.includes(cls.id)}
                            onCheckedChange={() => toggleClass(cls.id)}
                          />
                        </td>
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

      <AddClassModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onClassAdded={handleClassAdded} />
    </main>
  )
}
