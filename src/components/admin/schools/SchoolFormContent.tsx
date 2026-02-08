import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SchoolFormValues } from "@/lib/validations/school"
import { FORM_STEPS } from "./constants"
import { BasicInfoStep } from "./steps/BasicInfoStep"
import { AddressStep } from "./steps/AddressStep"
import { ContactStep } from "./steps/ContactStep"
import { ConfigurationStep } from "./steps/ConfigurationStep"

interface SchoolFormContentProps {
  currentStep: number
  form: UseFormReturn<SchoolFormValues>
}

const STEP_DESCRIPTIONS = {
  1: "Dados essenciais da instituição",
  2: "Localização da escola",
  3: "Formas de contato",
  4: "Ajustes finais e preferências",
} as const

const STEP_COMPONENTS = {
  1: BasicInfoStep,
  2: AddressStep,
  3: ContactStep,
  4: ConfigurationStep,
} as const

export function SchoolFormContent({ currentStep, form }: SchoolFormContentProps) {
  const StepComponent = STEP_COMPONENTS[currentStep as keyof typeof STEP_COMPONENTS]
  const Icon = FORM_STEPS[currentStep - 1].icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          {FORM_STEPS[currentStep - 1].title}
        </CardTitle>
        <CardDescription>
          {STEP_DESCRIPTIONS[currentStep as keyof typeof STEP_DESCRIPTIONS]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StepComponent form={form} />
      </CardContent>
    </Card>
  )
}
