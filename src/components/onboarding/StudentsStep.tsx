import { useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import type { StudentEntry, ParentEntry, StudentsFormState } from "./types"

interface StudentsStepProps {
  form: StudentsFormState
  onUpdate: (field: keyof StudentsFormState, value: string) => void
  students: StudentEntry[]
  onAddStudent: () => void
  onRemoveStudent: (id: string) => void
  parents: Record<string, ParentEntry[]>
  onAddParent: (studentId: string, parent: Omit<ParentEntry, "status">) => void
}

interface ParentFormState {
  name: string
  email: string
  whatsapp: string
}

const EMPTY_PARENT: ParentFormState = { name: "", email: "", whatsapp: "" }

export function StudentsStep({
  form,
  onUpdate,
  students,
  onAddStudent,
  onRemoveStudent,
  parents,
  onAddParent,
}: StudentsStepProps) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [parentForm, setParentForm] = useState<ParentFormState>(EMPTY_PARENT)

  const handleAddParent = (studentId: string) => {
    if (parentForm.name && parentForm.email && parentForm.whatsapp) {
      onAddParent(studentId, parentForm)
      setParentForm(EMPTY_PARENT)
      setExpandedStudent(null)
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Cadastrar Alunos e Responsáveis</CardTitle>
        <CardDescription>Adicione os alunos e vincule seus responsáveis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Student */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Adicionar Aluno</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Aluno</Label>
              <Input
                placeholder="Pedro Souza"
                value={form.newStudentName}
                onChange={(e) => onUpdate("newStudentName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Turma</Label>
              <Select value={form.newStudentClass} onValueChange={(v) => onUpdate("newStudentClass", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G3">G3</SelectItem>
                  <SelectItem value="1ºA">1º Ano A</SelectItem>
                  <SelectItem value="2ºB">2º Ano B</SelectItem>
                  <SelectItem value="3ºA">3º Ano A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={onAddStudent} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Aluno
          </Button>
        </div>

        {/* Student List */}
        {students.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Alunos Cadastrados</Label>
            {students.map((student) => (
              <div key={student.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Turma: {student.class}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {parents[student.id]?.length || 0}/2 responsáveis
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveStudent(student.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Parents */}
                <div className="pl-4 border-l-2 space-y-2">
                  <Label className="text-xs">Responsáveis</Label>
                  {parents[student.id]?.map((parent, idx) => (
                    <div key={idx} className="text-sm bg-muted p-2 rounded">
                      <p className="font-medium">{parent.name}</p>
                      <p className="text-muted-foreground">{parent.email}</p>
                      <p className="text-muted-foreground">{parent.whatsapp}</p>
                      <Badge variant="secondary" className="mt-1">{parent.status}</Badge>
                    </div>
                  ))}

                  {(!parents[student.id] || parents[student.id].length < 2) && (
                    <>
                      {expandedStudent === student.id ? (
                        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Nome do responsável</Label>
                            <Input
                              placeholder="Ana Silva"
                              value={parentForm.name}
                              onChange={(e) => setParentForm((p) => ({ ...p, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">E-mail</Label>
                            <Input
                              type="email"
                              placeholder="ana@email.com"
                              value={parentForm.email}
                              onChange={(e) => setParentForm((p) => ({ ...p, email: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">WhatsApp</Label>
                            <Input
                              placeholder="(11) 99999-0000"
                              value={parentForm.whatsapp}
                              onChange={(e) => setParentForm((p) => ({ ...p, whatsapp: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddParent(student.id)}
                              disabled={!parentForm.name || !parentForm.email || !parentForm.whatsapp}
                            >
                              Adicionar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setExpandedStudent(null)
                                setParentForm(EMPTY_PARENT)
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setExpandedStudent(student.id)
                            setParentForm(EMPTY_PARENT)
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar Responsável
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </>
  )
}
