import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Trash2, Plus } from "lucide-react"
import type { UsersFormState, TeacherEntry } from "./types"

interface UsersStepProps {
  form: UsersFormState
  onUpdate: (field: keyof UsersFormState, value: string) => void
  teachers: TeacherEntry[]
  onAddTeacher: () => void
  onRemoveTeacher: (index: number) => void
  onSendSecretaryInvite: () => void
}

export function UsersStep({
  form,
  onUpdate,
  teachers,
  onAddTeacher,
  onRemoveTeacher,
  onSendSecretaryInvite,
}: UsersStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Criar Usuários Internos</CardTitle>
        <CardDescription>Cadastre membros da secretaria e professores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Secretaria */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Secretaria
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Maria Silva"
                value={form.secretaryName}
                onChange={(e) => onUpdate("secretaryName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="maria@escola.com"
                value={form.secretaryEmail}
                onChange={(e) => onUpdate("secretaryEmail", e.target.value)}
              />
            </div>
          </div>
          <Button onClick={onSendSecretaryInvite} variant="outline" className="w-full">
            Enviar Convite
          </Button>
        </div>

        {/* Professores */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Professores
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="João Santos"
                value={form.newTeacherName}
                onChange={(e) => onUpdate("newTeacherName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="joao@escola.com"
                value={form.newTeacherEmail}
                onChange={(e) => onUpdate("newTeacherEmail", e.target.value)}
              />
            </div>
          </div>
          <Button onClick={onAddTeacher} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Professor
          </Button>

          {teachers.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm text-muted-foreground">Professores Adicionados</Label>
              {teachers.map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{teacher.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveTeacher(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </>
  )
}
