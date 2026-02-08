import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { FORM_STEPS } from "./constants"

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {FORM_STEPS.map((step, index) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-blue-600 border-blue-600 text-white",
                  isCurrent && "border-blue-600 text-blue-600 bg-blue-50",
                  !isCompleted && !isCurrent && "border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm mt-2 font-medium text-center",
                  (isCompleted || isCurrent) && "text-blue-600",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < FORM_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 transition-all duration-300",
                  isCompleted ? "bg-blue-600" : "bg-gray-300"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
