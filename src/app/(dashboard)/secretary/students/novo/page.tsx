"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { maskPhone, maskCPF } from "@/lib/utils/masks"
import { FormPageHeader } from "@/components/ui/form-page-header"
import { StickyFooter } from "@/components/ui/sticky-footer"
import { StudentForm } from "@/components/students"
import type { StudentFormState, ClassOption } from "@/components/students"

const INITIAL_FORM: StudentFormState = {
  studentName: "",
  studentEmail: "",
  studentPhone: "",
  dateOfBirth: "",
  cpf: "",
  registrationId: "",
  classId: "",
  status: "ACTIVE",
  parent1Id: "",
  parent1Name: "",
  parent1Email: "",
  parent1Phone: "",
  parent1Kinship: "",
  parent1Cpf: "",
  parent2Id: "",
  parent2Name: "",
  parent2Email: "",
  parent2Phone: "",
  parent2Kinship: "",
  parent2Cpf: "",
  healthInfo: "",
  observations: "",
}

export default function NovoAlunoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [showParent2, setShowParent2] = useState(false)
  const [form, setForm] = useState<StudentFormState>(INITIAL_FORM)

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
      <FormPageHeader
        backPath="/secretary/students"
        backLabel="Voltar para alunos"
        title="Cadastrar aluno"
        description={<>Preencha as informações do aluno e de pelo menos um responsável. Campos com <span className="text-destructive">*</span> são obrigatórios.</>}
      />

      <form onSubmit={handleSubmit}>
        <StudentForm
          form={form}
          onUpdate={update}
          onUpdatePhone={updatePhone}
          onUpdateCPF={updateCPF}
          classOptions={classes}
          showParent2={showParent2}
          onShowParent2Change={setShowParent2}
          disabled={isSubmitting}
        />
      </form>

      <StickyFooter
        cancelPath="/secretary/students"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Cadastrar aluno"
        submittingLabel="Cadastrando..."
      />
    </div>
  )
}
