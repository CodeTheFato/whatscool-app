"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TeacherClassAssignments } from "./TeacherClassAssignments"
import type { ClassTeacherAssignment } from "./types"

interface Option {
  id: string
  name: string
}

export interface TeacherFormState {
  name: string
  email: string
  phone: string
  cpf: string
  dateOfBirth: string
  registrationId: string
  specialization: string
  status: string
  observations: string
  internalNotes: string
}

interface TeacherFormProps {
  form: TeacherFormState
  onUpdate: (field: string, value: string) => void
  onUpdatePhone: (field: string, value: string) => void
  onUpdateCPF: (field: string, value: string) => void
  assignments: ClassTeacherAssignment[]
  onAssignmentsChange: (assignments: ClassTeacherAssignment[]) => void
  classOptions: Option[]
  subjectOptions: Option[]
  disabled?: boolean
  showStatus?: boolean
}

export function TeacherForm({
  form,
  onUpdate,
  onUpdatePhone,
  onUpdateCPF,
  assignments,
  onAssignmentsChange,
  classOptions,
  subjectOptions,
  disabled,
  showStatus = false,
}: TeacherFormProps) {
  return (
    <div className="space-y-6">
      {/* ─── Card: Dados do professor ─────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do professor</CardTitle>
          <CardDescription>Informações pessoais e de contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name">
                Nome completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nome do professor"
                value={form.name}
                onChange={(e) => onUpdate("name", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => onUpdate("email", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp / Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => onUpdatePhone("phone", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationId">Matrícula</Label>
              <Input
                id="registrationId"
                placeholder="Ex: PROF-2026001"
                value={form.registrationId}
                onChange={(e) => onUpdate("registrationId", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Especialização</Label>
              <Input
                id="specialization"
                placeholder="Ex: Licenciatura em Matemática"
                value={form.specialization}
                onChange={(e) => onUpdate("specialization", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Data de nascimento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => onUpdate("dateOfBirth", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => onUpdateCPF("cpf", e.target.value)}
                disabled={disabled}
              />
            </div>

            {showStatus && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => onUpdate("status", v)}
                  disabled={disabled}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="ON_LEAVE">Afastado</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Card: Vínculos com turmas ────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vínculos com turmas</CardTitle>
          <CardDescription>
            Turmas e disciplinas que o professor leciona.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherClassAssignments
            assignments={assignments}
            onChange={onAssignmentsChange}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* ─── Card: Informações adicionais ─────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações adicionais</CardTitle>
          <CardDescription>
            Registros complementares visíveis internamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="observations">Observações gerais</Label>
              <Textarea
                id="observations"
                placeholder="Informações relevantes sobre o professor, disponibilidade, preferências..."
                value={form.observations}
                onChange={(e) => onUpdate("observations", e.target.value)}
                disabled={disabled}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalNotes">Notas internas</Label>
              <Textarea
                id="internalNotes"
                placeholder="Anotações internas sobre o professor..."
                value={form.internalNotes}
                onChange={(e) => onUpdate("internalNotes", e.target.value)}
                disabled={disabled}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Visível apenas para a secretaria e coordenação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
