"use client"

import { Plus, Trash2, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ClassTeacherAssignment {
  id: string
  classId: string
  subjectId: string
  role: "MAIN" | "SUBJECT" | "ASSISTANT"
}

interface Option {
  id: string
  name: string
}

interface TeacherClassAssignmentsProps {
  assignments: ClassTeacherAssignment[]
  onChange: (assignments: ClassTeacherAssignment[]) => void
  classOptions: Option[]
  subjectOptions: Option[]
  disabled?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  MAIN: "Professor titular",
  SUBJECT: "Professor da disciplina",
  ASSISTANT: "Assistente",
}

let nextId = 1

export function TeacherClassAssignments({
  assignments,
  onChange,
  classOptions,
  subjectOptions,
  disabled,
}: TeacherClassAssignmentsProps) {
  const addRow = () => {
    onChange([
      ...assignments,
      { id: `new-${nextId++}`, classId: "", subjectId: "", role: "SUBJECT" },
    ])
  }

  const removeRow = (id: string) => {
    onChange(assignments.filter((a) => a.id !== id))
  }

  const updateRow = (id: string, field: keyof ClassTeacherAssignment, value: string) => {
    onChange(
      assignments.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    )
  }

  return (
    <div className="space-y-3">
      {assignments.length === 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed bg-muted/20 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum vínculo adicionado ainda.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Você pode cadastrar o professor agora e vincular turmas depois.
          </p>
        </div>
      )}

      {assignments.map((assignment) => {
        const isMain = assignment.role === "MAIN"
        return (
          <div
            key={assignment.id}
            className={`relative rounded-lg border p-4 transition-colors ${isMain
                ? "border-primary/30 bg-primary/[0.03]"
                : "border-border bg-muted/20"
              }`}
          >
            {/* MAIN badge */}
            {isMain && (
              <div className="mb-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
                >
                  <Star className="mr-1 h-3 w-3" />
                  Professor titular
                </Badge>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {/* Class */}
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium">Turma</label>
                <Select
                  value={assignment.classId}
                  onValueChange={(v) => updateRow(assignment.id, "classId", v)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium">
                  Disciplina
                  {isMain && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  )}
                </label>
                <Select
                  value={assignment.subjectId}
                  onValueChange={(v) => updateRow(assignment.id, "subjectId", v)}
                  disabled={disabled}
                >
                  <SelectTrigger className={isMain && !assignment.subjectId ? "text-muted-foreground" : ""}>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((subj) => (
                      <SelectItem key={subj.id} value={subj.id}>
                        {subj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isMain && (
                  <p className="text-xs text-muted-foreground">
                    Para professor titular, a disciplina é opcional.
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium">Papel</label>
                <Select
                  value={assignment.role}
                  onValueChange={(v) => updateRow(assignment.id, "role", v)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Remove */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(assignment.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover vínculo</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remover vínculo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        disabled={disabled}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Adicionar vínculo
      </Button>
    </div>
  )
}
