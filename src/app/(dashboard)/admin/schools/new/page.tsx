"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { schoolFormSchema, type SchoolFormValues } from "@/lib/validations/school"
import { StepIndicator } from "@/components/admin/schools/StepIndicator"
import { SchoolFormContent } from "@/components/admin/schools/SchoolFormContent"
import { StepNavigation } from "@/components/admin/schools/StepNavigation"
import { useSchoolFormSteps } from "@/hooks/useSchoolFormSteps"
import { FORM_STEPS } from "@/components/admin/schools/constants"

export default function NewSchoolPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      schoolType: "",
      studentCount: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      whatsapp: "",
      whatsappType: undefined,
      timezone: "America/Sao_Paulo",
      logo: "",
    },
  })

  const { currentStep, handleNext, handlePrevious, handleKeyDown } = useSchoolFormSteps(form)

  const onSubmit = async (data: SchoolFormValues) => {
    // Proteção: só permite submit no último step
    if (currentStep !== FORM_STEPS.length) {
      toast.warning("Você precisa estar no último step para salvar")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implementar chamada à API

      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Escola cadastrada com sucesso!")
      router.push("/admin/schools")
    } catch (error) {
      toast.error("Erro ao cadastrar escola")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/schools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Nova Escola</h1>
          <p className="text-muted-foreground">
            Cadastre uma nova instituição de ensino
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Form Content */}
      <div onKeyDown={handleKeyDown}>
        <SchoolFormContent currentStep={currentStep} form={form} />

        {/* Navigation */}
        <StepNavigation
          currentStep={currentStep}
          isLoading={isLoading}
          form={form}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  )
}
