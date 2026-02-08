import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { SchoolFormValues } from "@/lib/validations/school"
import { toast } from "sonner"
import { FORM_STEPS } from "../components/admin/schools/constants"

export function useSchoolFormSteps(form: UseFormReturn<SchoolFormValues>) {
  const [currentStep, setCurrentStep] = useState(1)

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof SchoolFormValues)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["name"]
        break
      case 2:
        fieldsToValidate = ["city", "state"]
        break
      case 3:
        fieldsToValidate = ["phone", "email"]
        break
      case 4:
        fieldsToValidate = ["timezone"]
        break
    }

    const result = await form.trigger(fieldsToValidate)
    return result
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)

    if (isValid && currentStep < FORM_STEPS.length) {
      // Pequeno delay para evitar double-click ou enter acidental
      await new Promise((resolve) => setTimeout(resolve, 100))
      setCurrentStep(currentStep + 1)
    } else if (!isValid) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Previne Enter de disparar submit em qualquer lugar
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault()

      // Se não estiver no último step, avança
      if (currentStep < FORM_STEPS.length) {
        handleNext()
      }
    }
  }

  return {
    currentStep,
    handleNext,
    handlePrevious,
    handleKeyDown,
  }
}
