"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { maskPhone, maskCPF } from "@/lib/utils/masks"
import {
  TeacherClassAssignments,
  type ClassTeacherAssignment,
} from "@/components/secretary/teachers/TeacherClassAssignments"

interface Option {
  id: string
  name: string
}

// Mock data – will be replaced by real API calls
const MOCK_CLASSES: Option[] = [
  { id: "c1", name: "1ºA" },
  { id: "c2", name: "1ºB" },
  { id: "c3", name: "2ºA" },
  { id: "c4", name: "3ºA" },
]

const MOCK_SUBJECTS: Option[] = [
  { id: "s1", name: "Matemática" },
  { id: "s2", name: "Português" },
  { id: "s3", name: "Ciências" },
  { id: "s4", name: "História" },
  { id: "s5", name: "Geografia" },
  { id: "s6", name: "Educação Física" },
  { id: "s7", name: "Inglês" },
  { id: "s8", name: "Artes" },
]

export default function NovoProfessorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<Option[]>([])
  const [subjects, setSubjects] = useState<Option[]>([])
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([])

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    dateOfBirth: "",
    registrationId: "",
    specialization: "",
    observations: "",
    internalNotes: "",
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      // TODO: Replace with real API calls
      // const [classesRes, subjectsRes] = await Promise.all([
      //   fetch("/api/classes"),
      //   fetch("/api/subjects"),
      // ])
      await new Promise((r) => setTimeout(r, 200))
      setClasses(MOCK_CLASSES)
      setSubjects(MOCK_SUBJECTS)
    } catch (error) {
      console.error("Error fetching options:", error)
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
    if (!form.name || !form.email || !form.phone) {
      toast.error("Preencha os campos obrigatórios do professor.")
      return
    }

    try {
      setIsSubmitting(true)

      // TODO: Replace with real API call
      // const res = await fetch("/api/teachers", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...form, assignments }),
      // })
      await new Promise((r) => setTimeout(r, 600))

      toast.success("Professor cadastrado com sucesso!")
      router.push("/secretary/teachers")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar professor"
      )
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
          onClick={() => router.push("/secretary/teachers")}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar para professores
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cadastrar professor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha as informações do professor e associe suas turmas e disciplinas.
          Campos com <span className="text-destructive">*</span> são
          obrigatórios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Card: Dados do professor ─────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do professor</CardTitle>
            <CardDescription>
              Informações pessoais e de contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Row 1: Nome (full width) */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">
                  Nome completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nome do professor"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 2: Email + Telefone */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  WhatsApp / Telefone{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => updatePhone("phone", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 3: Matrícula + Especialização */}
              <div className="space-y-2">
                <Label htmlFor="registrationId">Matrícula</Label>
                <Input
                  id="registrationId"
                  placeholder="Ex: PROF-2026001"
                  value={form.registrationId}
                  onChange={(e) => update("registrationId", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input
                  id="specialization"
                  placeholder="Ex: Licenciatura em Matemática"
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 4: Data nascimento + CPF */}
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
            </div>
          </CardContent>
        </Card>

        {/* ─── Card: Vínculos com turmas ────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vínculos com turmas</CardTitle>
            <CardDescription>
              Associe o professor às turmas e disciplinas que ele leciona. Você pode deixar esta seção vazia e vincular depois.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherClassAssignments
              assignments={assignments}
              onChange={setAssignments}
              classOptions={classes}
              subjectOptions={subjects}
              disabled={isSubmitting}
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
                  onChange={(e) => update("observations", e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Notas internas</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Anotações internas sobre o professor..."
                  value={form.internalNotes}
                  onChange={(e) => update("internalNotes", e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Visível apenas para a secretaria e coordenação.
                </p>
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
            onClick={() => router.push("/secretary/teachers")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar professor"}
          </Button>
        </div>
      </div>
    </div>
  )
}
