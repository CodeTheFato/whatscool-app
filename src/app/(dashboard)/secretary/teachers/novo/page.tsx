"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { maskPhone, maskCPF } from "@/lib/utils/masks"
import { TeacherForm } from "@/components/teachers"
import type { TeacherFormState, ClassTeacherAssignment } from "@/components/teachers"

interface Option {
  id: string
  name: string
}

export default function NovoProfessorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<Option[]>([])
  const [subjects, setSubjects] = useState<Option[]>([])
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([])

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
    fetchOptions()
  }, [])

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

    if (!form.name || !form.email || !form.phone) {
      toast.error("Preencha os campos obrigatórios do professor.")
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        ...form,
        assignments: assignments.map((a) => ({
          classId: a.classId,
          subjectId: a.subjectId || null,
          role: a.role,
        })),
      }

      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Erro ao cadastrar professor")
      }

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
        />
      </form>

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
