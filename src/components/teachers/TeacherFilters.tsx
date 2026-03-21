"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClassOption {
  id: string
  name: string
}

interface TeacherFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  classFilter: string
  onClassFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  classes: ClassOption[]
}

export function TeacherFilters({
  searchTerm,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  statusFilter,
  onStatusFilterChange,
  classes,
}: TeacherFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email, turma ou disciplina..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={classFilter} onValueChange={onClassFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Turma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as turmas</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.name}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="ACTIVE">Ativo</SelectItem>
          <SelectItem value="ON_LEAVE">Afastado</SelectItem>
          <SelectItem value="INACTIVE">Inativo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
