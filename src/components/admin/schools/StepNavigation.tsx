import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FORM_STEPS } from "./constants"
import { toast } from "sonner"
import { UseFormReturn } from "react-hook-form"
import { SchoolFormValues } from "@/lib/validations/school"

interface StepNavigationProps {
  currentStep: number
  isLoading: boolean
  form: UseFormReturn<SchoolFormValues>
  onPrevious: () => void
  onNext: () => void
  onSubmit: (data: SchoolFormValues) => Promise<void>
}

export function StepNavigation({
  currentStep,
  isLoading,
  form,
  onPrevious,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  const isLastStep = currentStep === FORM_STEPS.length

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      await onSubmit(form.getValues())
    } else {
      toast.error("Por favor, preencha todos os campos obrigatórios")
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <div>
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={onPrevious}>
            Voltar
          </Button>
        )}
      </div>
      <div className="flex gap-3">
        <Link href="/admin/schools">
          <Button variant="ghost" type="button">
            Cancelar
          </Button>
        </Link>
        {!isLastStep ? (
          <Button type="button" onClick={handleNext}>
            Próximo
          </Button>
        ) : (
          <Button type="button" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? "Cadastrando..." : "Cadastrar Escola"}
          </Button>
        )}
      </div>
    </div>
  )
}
