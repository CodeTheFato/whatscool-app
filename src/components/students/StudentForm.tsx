"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { ParentFields } from "./ParentFields"
import type { StudentFormState, ClassOption } from "./types"

interface StudentFormProps {
  form: StudentFormState
  onUpdate: (field: string, value: string) => void
  onUpdatePhone: (field: string, value: string) => void
  onUpdateCPF: (field: string, value: string) => void
  classOptions: ClassOption[]
  showParent2: boolean
  onShowParent2Change: (show: boolean) => void
  disabled?: boolean
  showStatus?: boolean
}

export function StudentForm({
  form,
  onUpdate,
  onUpdatePhone,
  onUpdateCPF,
  classOptions,
  showParent2,
  onShowParent2Change,
  disabled,
  showStatus = false,
}: StudentFormProps) {
  const formRecord = form as unknown as Record<string, string>

  const handleRemoveParent2 = () => {
    onShowParent2Change(false)
    onUpdate("parent2Id", "")
    onUpdate("parent2Name", "")
    onUpdate("parent2Email", "")
    onUpdate("parent2Phone", "")
    onUpdate("parent2Kinship", "")
    onUpdate("parent2Cpf", "")
  }

  return (
    <div className="space-y-6">
      {/* ─── Card: Dados do aluno ─────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do aluno</CardTitle>
          <CardDescription>Informações básicas de identificação.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="studentName">
                Nome completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentName"
                placeholder="Nome do aluno"
                value={form.studentName}
                onChange={(e) => onUpdate("studentName", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentEmail">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={form.studentEmail}
                onChange={(e) => onUpdate("studentEmail", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentPhone">WhatsApp / Telefone</Label>
              <Input
                id="studentPhone"
                placeholder="(00) 00000-0000"
                value={form.studentPhone}
                onChange={(e) => onUpdatePhone("studentPhone", e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="registrationId">
                Matrícula <span className="text-destructive">*</span>
              </Label>
              <Input
                id="registrationId"
                placeholder="Ex: 2026001"
                value={form.registrationId}
                onChange={(e) => onUpdate("registrationId", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Turma</Label>
              <Select
                value={form.classId || (showStatus ? "none" : undefined)}
                onValueChange={(v) => onUpdate("classId", v === "none" ? "" : v)}
                disabled={disabled}
              >
                <SelectTrigger id="classId">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {showStatus && <SelectItem value="none">Sem turma</SelectItem>}
                  {classOptions.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="TRANSFERRED">Transferido</SelectItem>
                    <SelectItem value="GRADUATED">Formado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Card: Responsável 1 ──────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Responsável 1</CardTitle>
          <CardDescription>Dados do responsável principal do aluno.</CardDescription>
        </CardHeader>
        <CardContent>
          <ParentFields
            prefix="parent1"
            form={formRecord}
            onUpdate={onUpdate}
            onUpdatePhone={onUpdatePhone}
            onUpdateCPF={onUpdateCPF}
            disabled={disabled}
            required
          />
        </CardContent>
      </Card>

      {/* ─── Card: Responsável 2 (toggle) ─────────── */}
      {!showParent2 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onShowParent2Change(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Adicionar segundo responsável
        </Button>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">Responsável 2</CardTitle>
              <CardDescription>Dados do segundo responsável (opcional).</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleRemoveParent2}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Remover
            </Button>
          </CardHeader>
          <CardContent>
            <ParentFields
              prefix="parent2"
              form={formRecord}
              onUpdate={onUpdate}
              onUpdatePhone={onUpdatePhone}
              onUpdateCPF={onUpdateCPF}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      )}

      {/* ─── Card: Informações adicionais ─────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações adicionais</CardTitle>
          <CardDescription>Dados complementares (opcionais).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="healthInfo">Informações de saúde</Label>
              <Textarea
                id="healthInfo"
                placeholder="Alergias, medicamentos, condições de saúde relevantes..."
                value={form.healthInfo}
                onChange={(e) => onUpdate("healthInfo", e.target.value)}
                disabled={disabled}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Essas informações ficam visíveis apenas para professores e coordenação.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações internas</Label>
              <Textarea
                id="observations"
                placeholder="Observações internas sobre o aluno..."
                value={form.observations}
                onChange={(e) => onUpdate("observations", e.target.value)}
                disabled={disabled}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
