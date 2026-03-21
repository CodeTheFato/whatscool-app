import { Check, Building2, Users, UserPlus } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { UserRole } from "@/types/auth"

interface StepDef {
  number: number
  label: string
  icon: LucideIcon
}

const ADMIN_STEPS: StepDef[] = [
  { number: 1, label: "Escola", icon: Building2 },
  { number: 2, label: "Usuários", icon: Users },
  { number: 3, label: "Alunos", icon: UserPlus },
]

const DEFAULT_STEPS: StepDef[] = [
  { number: 1, label: "Usuários", icon: Users },
  { number: 2, label: "Alunos", icon: UserPlus },
]

interface OnboardingStepperProps {
  currentRole: UserRole
  currentStep: number
}

export function OnboardingStepper({ currentRole, currentStep }: OnboardingStepperProps) {
  const steps = currentRole === "ADMIN" ? ADMIN_STEPS : DEFAULT_STEPS
  const adjustedStep = currentRole === "ADMIN" ? currentStep : currentStep + 1

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = step.number === adjustedStep
          const isCompleted = step.number < adjustedStep

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted || isActive
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className="text-sm font-medium text-gray-600">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 h-0.5 mx-4 ${isCompleted ? "bg-primary" : "bg-gray-300"}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
