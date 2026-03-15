"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { maskPhone, maskCPF } from "@/lib/utils/masks"

interface ClassOption {
  id: string
  name: string
}

export default function NovoAlunoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [showParent2, setShowParent2] = useState(false)

  // Form state
  const [form, setForm] = useState({
    // Student
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    dateOfBirth: "",
    cpf: "",
    registrationId: "",
    classId: "",
    // Parent 1
    parent1Name: "",
    parent1Email: "",
    parent1Phone: "",
    parent1Kinship: "",
    parent1Cpf: "",
    // Parent 2
    parent2Name: "",
    parent2Email: "",
    parent2Phone: "",
    parent2Kinship: "",
    parent2Cpf: "",
    // Additional
    healthInfo: "",
    observations: "",
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes")
      if (res.ok) {
        const data = await res.json()
        setClasses(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updatePhone = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: maskPhone(value) }))
  }

  const updateCPF = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: maskCPF(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!form.studentName || !form.studentEmail || !form.registrationId) {
      toast.error("Preencha os campos obrigatórios do aluno.")
      return
    }
    if (!form.parent1Name || !form.parent1Email || !form.parent1Phone || !form.parent1Kinship) {
      toast.error("Preencha os campos obrigatórios do responsável 1.")
      return
    }

    try {
      setIsSubmitting(true)

      const body: Record<string, unknown> = {
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        studentPhone: form.studentPhone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        cpf: form.cpf || undefined,
        registrationId: form.registrationId,
        classId: form.classId || undefined,
        parent1Name: form.parent1Name,
        parent1Email: form.parent1Email,
        parent1Phone: form.parent1Phone,
        parent1Kinship: form.parent1Kinship,
        parent1Cpf: form.parent1Cpf || undefined,
        healthInfo: form.healthInfo || undefined,
      }

      if (showParent2 && form.parent2Name && form.parent2Email) {
        body.parent2Name = form.parent2Name
        body.parent2Email = form.parent2Email
        body.parent2Phone = form.parent2Phone
        body.parent2Kinship = form.parent2Kinship
        body.parent2Cpf = form.parent2Cpf || undefined
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao cadastrar aluno")
      }

      toast.success("Aluno cadastrado com sucesso!")
      router.push("/secretary/students")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar aluno")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-24">
      {/* Back + header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 text-muted-foreground"
          onClick={() => router.push("/secretary/students")}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar para alunos
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Cadastrar aluno</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha as informações do aluno e de pelo menos um responsável. Campos com <span className="text-destructive">*</span> são obrigatórios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => update("studentName", e.target.value)}
                  disabled={isSubmitting}
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
                  onChange={(e) => update("studentEmail", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentPhone">WhatsApp / Telefone</Label>
                <Input
                  id="studentPhone"
                  placeholder="(00) 00000-0000"
                  value={form.studentPhone}
                  onChange={(e) => updatePhone("studentPhone", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Data de nascimento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => updateCPF("cpf", e.target.value)}
                  disabled={isSubmitting}
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
                  onChange={(e) => update("registrationId", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Turma</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) => update("classId", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="classId">
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="parent1Name">
                  Nome completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parent1Name"
                  placeholder="Nome do responsável"
                  value={form.parent1Name}
                  onChange={(e) => update("parent1Name", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent1Email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parent1Email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.parent1Email}
                  onChange={(e) => update("parent1Email", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent1Phone">
                  WhatsApp / Telefone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parent1Phone"
                  placeholder="(00) 00000-0000"
                  value={form.parent1Phone}
                  onChange={(e) => updatePhone("parent1Phone", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent1Kinship">
                  Parentesco <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.parent1Kinship}
                  onValueChange={(v) => update("parent1Kinship", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="parent1Kinship">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pai">Pai</SelectItem>
                    <SelectItem value="Mãe">Mãe</SelectItem>
                    <SelectItem value="Avô">Avô</SelectItem>
                    <SelectItem value="Avó">Avó</SelectItem>
                    <SelectItem value="Tio(a)">Tio(a)</SelectItem>
                    <SelectItem value="Responsável Legal">Responsável Legal</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent1Cpf">CPF</Label>
                <Input
                  id="parent1Cpf"
                  placeholder="000.000.000-00"
                  value={form.parent1Cpf}
                  onChange={(e) => updateCPF("parent1Cpf", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Card: Responsável 2 (toggle) ─────────── */}
        {!showParent2 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowParent2(true)}
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
                onClick={() => {
                  setShowParent2(false)
                  setForm((prev) => ({
                    ...prev,
                    parent2Name: "",
                    parent2Email: "",
                    parent2Phone: "",
                    parent2Kinship: "",
                    parent2Cpf: "",
                  }))
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Remover
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="parent2Name">Nome completo</Label>
                  <Input
                    id="parent2Name"
                    placeholder="Nome do responsável"
                    value={form.parent2Name}
                    onChange={(e) => update("parent2Name", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent2Email">Email</Label>
                  <Input
                    id="parent2Email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={form.parent2Email}
                    onChange={(e) => update("parent2Email", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent2Phone">WhatsApp / Telefone</Label>
                  <Input
                    id="parent2Phone"
                    placeholder="(00) 00000-0000"
                    value={form.parent2Phone}
                    onChange={(e) => updatePhone("parent2Phone", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent2Kinship">Parentesco</Label>
                  <Select
                    value={form.parent2Kinship}
                    onValueChange={(v) => update("parent2Kinship", v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="parent2Kinship">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pai">Pai</SelectItem>
                      <SelectItem value="Mãe">Mãe</SelectItem>
                      <SelectItem value="Avô">Avô</SelectItem>
                      <SelectItem value="Avó">Avó</SelectItem>
                      <SelectItem value="Tio(a)">Tio(a)</SelectItem>
                      <SelectItem value="Responsável Legal">Responsável Legal</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent2Cpf">CPF</Label>
                  <Input
                    id="parent2Cpf"
                    placeholder="000.000.000-00"
                    value={form.parent2Cpf}
                    onChange={(e) => updateCPF("parent2Cpf", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
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
                  onChange={(e) => update("healthInfo", e.target.value)}
                  disabled={isSubmitting}
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
                  onChange={(e) => update("observations", e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* ─── Sticky footer ──────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-6 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/secretary/students")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar aluno"}
          </Button>
        </div>
      </div>
    </div>
  )
}
