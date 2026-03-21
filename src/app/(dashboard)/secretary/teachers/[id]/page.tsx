"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { maskPhone, maskCPF } from "@/lib/utils/masks"
import { TeacherForm } from "@/components/teachers"
import type { TeacherFormState, ClassTeacherAssignment } from "@/components/teachers"

interface Option {
  id: string
  name: string
}

interface TeacherAssignment {
  id: string
  classId: string
  className: string
  subjectId: string | null
  subjectName: string | null
  role: string
}

interface TeacherDetail {
  id: string
  userId: string | null
  name: string
  email: string
  phone: string | null
  registrationId: string
  cpf: string | null
  dateOfBirth: string | null
  specialization: string | null
  internalNotes: string | null
  hireDate: string
  status: string
  isActive: boolean
  assignments: TeacherAssignment[]
  createdAt: string
  updatedAt: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
          Ativo
        </Badge>
      )
    case "ON_LEAVE":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          Afastado
        </Badge>
      )
    case "INACTIVE":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Inativo
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<Option[]>([])
  const [subjects, setSubjects] = useState<Option[]>([])
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([])
  const [originalData, setOriginalData] = useState<TeacherDetail | null>(null)

  const [form, setForm] = useState<TeacherFormState>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    dateOfBirth: "",
    registrationId: "",
    specialization: "",
    status: "ACTIVE",
    observations: "",
    internalNotes: "",
  })

  useEffect(() => {
    Promise.all([fetchTeacher(), fetchOptions()])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTeacher = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/teachers/${id}`)
      if (!res.ok) {
        toast.error("Professor não encontrado")
        router.push("/secretary/teachers")
        return
      }
      const data: TeacherDetail = await res.json()
      setOriginalData(data)

      setForm({
        name: data.name,
        email: data.email,
        phone: data.phone ? maskPhone(data.phone) : "",
        cpf: data.cpf ? maskCPF(data.cpf) : "",
        dateOfBirth: data.dateOfBirth ?? "",
        registrationId: data.registrationId,
        specialization: data.specialization ?? "",
        status: data.status,
        observations: "",
        internalNotes: data.internalNotes ?? "",
      })

      setAssignments(
        data.assignments.map((a) => ({
          id: a.id,
          classId: a.classId,
          subjectId: a.subjectId ?? "",
          role: a.role as "MAIN" | "SUBJECT" | "ASSISTANT",
        }))
      )
    } catch (error) {
      console.error("Error fetching teacher:", error)
      toast.error("Erro ao carregar professor")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/subjects"),
      ])

      if (classesRes.ok) {
        const data = await classesRes.json()
        setClasses(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
      }

      if (subjectsRes.ok) {
        const data = await subjectsRes.json()
        setSubjects(data.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
      }
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

    if (!form.name || !form.email) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        cpf: form.cpf || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        registrationId: form.registrationId || undefined,
        specialization: form.specialization || undefined,
        status: form.status,
        observations: form.observations || undefined,
        internalNotes: form.internalNotes || undefined,
        assignments: assignments.map((a) => ({
          classId: a.classId,
          subjectId: a.subjectId || null,
          role: a.role,
        })),
      }

      const res = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Erro ao atualizar professor")
      }

      toast.success("Professor atualizado com sucesso!")
      router.push("/secretary/teachers")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar professor"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Skeleton className="h-[340px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-24">
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar professor
          </h1>
          {originalData && getStatusBadge(originalData.status)}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize as informações do professor e seus vínculos com turmas.
          Campos com <span className="text-destructive">*</span> são obrigatórios.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <TeacherForm
          form={form}
          onUpdate={update}
          onUpdatePhone={updatePhone}
          onUpdateCPF={updateCPF}
          assignments={assignments}
          onAssignmentsChange={setAssignments}
          classOptions={classes}
          subjectOptions={subjects}
          disabled={isSubmitting}
          showStatus
        />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <p className="hidden text-xs text-muted-foreground sm:block">
            {originalData
              ? `Última atualização: ${new Date(originalData.updatedAt).toLocaleDateString("pt-BR")}`
              : ""}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/secretary/teachers")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
