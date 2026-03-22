"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { maskPhone, maskCPF } from "@/lib/utils/masks"
import { getStudentStatusBadge } from "@/lib/utils/status-badges"
import { FormPageHeader } from "@/components/ui/form-page-header"
import { StickyFooter } from "@/components/ui/sticky-footer"
import { StudentForm } from "@/components/students"
import type { StudentFormState, StudentDetail, ClassOption } from "@/components/students"

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

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [showParent2, setShowParent2] = useState(false)
  const [originalData, setOriginalData] = useState<StudentDetail | null>(null)
  const [form, setForm] = useState<StudentFormState>(INITIAL_FORM)

  useEffect(() => {
    Promise.all([fetchStudent(), fetchClasses()])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudent = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/students/${id}`)
      if (!res.ok) {
        toast.error("Aluno não encontrado")
        router.push("/secretary/students")
        return
      }
      const data: StudentDetail = await res.json()
      setOriginalData(data)

      const parent1 = data.parents[0]
      const parent2 = data.parents[1]

      setForm({
        studentName: data.name,
        studentEmail: data.email,
        studentPhone: data.phone ? maskPhone(data.phone) : "",
        dateOfBirth: data.dateOfBirth ?? "",
        cpf: data.cpf ? maskCPF(data.cpf) : "",
        registrationId: data.registrationId,
        classId: data.classId ?? "",
        status: data.status,
        parent1Id: parent1?.id ?? "",
        parent1Name: parent1?.name ?? "",
        parent1Email: parent1?.email ?? "",
        parent1Phone: parent1?.phone ? maskPhone(parent1.phone) : "",
        parent1Kinship: parent1?.kinship ?? "",
        parent1Cpf: parent1?.cpf ? maskCPF(parent1.cpf) : "",
        parent2Id: parent2?.id ?? "",
        parent2Name: parent2?.name ?? "",
        parent2Email: parent2?.email ?? "",
        parent2Phone: parent2?.phone ? maskPhone(parent2.phone) : "",
        parent2Kinship: parent2?.kinship ?? "",
        parent2Cpf: parent2?.cpf ? maskCPF(parent2.cpf) : "",
        healthInfo: data.healthInfo ?? "",
        observations: "",
      })

      if (parent2) setShowParent2(true)
    } catch (error) {
      console.error("Error fetching student:", error)
      toast.error("Erro ao carregar aluno")
    } finally {
      setIsLoading(false)
    }
  }

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
        name: form.studentName,
        email: form.studentEmail,
        phone: form.studentPhone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        cpf: form.cpf || undefined,
        registrationId: form.registrationId,
        classId: form.classId || null,
        healthInfo: form.healthInfo || undefined,
        status: form.status,
        guardian1: {
          id: form.parent1Id || undefined,
          name: form.parent1Name,
          email: form.parent1Email,
          phone: form.parent1Phone,
          kinship: form.parent1Kinship,
          cpf: form.parent1Cpf || undefined,
        },
      }

      if (showParent2 && form.parent2Name && form.parent2Email && form.parent2Phone && form.parent2Kinship) {
        body.guardian2 = {
          id: form.parent2Id || undefined,
          name: form.parent2Name,
          email: form.parent2Email,
          phone: form.parent2Phone,
          kinship: form.parent2Kinship,
          cpf: form.parent2Cpf || undefined,
        }
      } else {
        body.guardian2 = null
      }

      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao atualizar aluno")
      }

      toast.success("Aluno atualizado com sucesso!")
      router.push("/secretary/students")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar aluno")
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
        <Skeleton className="h-[260px] w-full rounded-lg" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <FormPageHeader
        backPath="/secretary/students"
        backLabel="Voltar para alunos"
        title="Editar aluno"
        description={<>Atualize as informações do aluno e de seus responsáveis. Campos com <span className="text-destructive">*</span> são obrigatórios.</>}
        statusBadge={originalData ? getStudentStatusBadge(originalData.status) : undefined}
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
          showStatus
        />
      </form>

      <StickyFooter
        cancelPath="/secretary/students"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        extraLeft={
          <p className="hidden text-xs text-muted-foreground sm:block">
            {originalData ? `Última atualização: ${new Date(originalData.updatedAt).toLocaleDateString("pt-BR")}` : ""}
          </p>
        }
      />
    </div>
  )
}
