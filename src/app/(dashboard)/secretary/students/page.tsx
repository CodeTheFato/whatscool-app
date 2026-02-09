"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Trash2, Edit, Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AddStudentModal } from "@/components/secretary/students/AddStudentModal"

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  registrationId: string
  class: string | null
  guardianName: string
  guardianPhone: string
  parents: Array<{
    id: string
    name: string
    email: string
    phone: string
    kinship: string
    isActive: boolean
  }>
  status: string
  isActive: boolean
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedStudents(selectedStudents.length === students.length ? [] : students.map((s) => s.id))
  }

  const getClassColor = (className: string | null) => {
    if (!className) return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    if (className.includes("1st") || className.includes("1ª")) return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    if (className.includes("2nd") || className.includes("2ª")) return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    if (className.includes("3rd") || className.includes("3ª")) return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = classFilter === "all" || student.class === classFilter
    return matchesSearch && matchesClass
  })

  const handleStudentAdded = () => {
    fetchStudents()
    setIsAddModalOpen(false)
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground mt-2">Gerenciar registros e informações dos alunos</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Alunos</h1>
        <p className="text-muted-foreground mt-2">Gerenciar registros e informações dos alunos</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, matrícula ou turma"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              <SelectItem value="1ª Série A">1ª Série A</SelectItem>
              <SelectItem value="2ª Série A">2ª Série A</SelectItem>
              <SelectItem value="3ª Série A">3ª Série A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Adicionar Aluno
        </Button>
      </div>

      {/* Table Container */}
      {filteredStudents.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Nenhum aluno encontrado</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg">
          {/* Bulk Actions */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Checkbox checked={selectedStudents.length === filteredStudents.length} onCheckedChange={toggleAll} />
              <span className="text-sm text-muted-foreground">Selecionar todos</span>
            </div>

            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedStudents.length} selecionado(s)</span>
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                  Mensagem aos Responsáveis
                </Button>
                <Button variant="secondary" size="sm">
                  Exportar Lista
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12"></th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Aluno</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Matrícula</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Turma</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Responsável</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contato</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{student.registrationId}</td>
                    <td className="p-4">
                      <Badge className={getClassColor(student.class)}>{student.class || "Sem turma"}</Badge>
                    </td>
                    <td className="p-4 text-sm">{student.guardianName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {student.guardianPhone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-accent rounded transition-colors text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-accent rounded transition-colors text-orange-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-accent rounded transition-colors text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Anterior
            </Button>

            <Button variant={currentPage === 1 ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(1)}>
              1
            </Button>
            <Button variant={currentPage === 2 ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(2)}>
              2
            </Button>
            <Button variant={currentPage === 3 ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(3)}>
              3
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => p + 1)}>
              Próximo
            </Button>
          </div>
        </div>
      )}

      <AddStudentModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onStudentAdded={handleStudentAdded} />
    </main>
  )
}
