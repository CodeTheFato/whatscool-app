"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { RoleSelector } from "@/components/auth/RoleSelector"
import { OnboardingStepper, SchoolStep, UsersStep, StudentsStep } from "@/components/onboarding"
import { useOnboarding } from "@/hooks/useOnboarding"

export default function OnboardingPage() {
  const ob = useOnboarding()

  const isSchoolStep = ob.currentRole === "ADMIN" && ob.currentStep === 1
  const isUsersStep =
    (ob.currentRole === "ADMIN" && ob.currentStep === 2) ||
    (ob.currentRole !== "ADMIN" && ob.currentStep === 1)
  const isStudentsStep =
    (ob.currentRole === "ADMIN" && ob.currentStep === 3) ||
    (ob.currentRole !== "ADMIN" && ob.currentStep === 2)

  return (
    <>
      <RoleSelector value={ob.currentRole} onChange={ob.setCurrentRole} />

      <div className="max-w-4xl mx-auto">
        <OnboardingStepper currentRole={ob.currentRole} currentStep={ob.currentStep} />

        <Card className="shadow-lg">
          {isSchoolStep && (
            <SchoolStep form={ob.schoolForm} onUpdate={ob.updateSchool} />
          )}

          {isUsersStep && (
            <UsersStep
              form={ob.usersForm}
              onUpdate={ob.updateUsers}
              teachers={ob.teachers}
              onAddTeacher={ob.addTeacher}
              onRemoveTeacher={ob.removeTeacher}
              onSendSecretaryInvite={ob.sendSecretaryInvite}
            />
          )}

          {isStudentsStep && (
            <StudentsStep
              form={ob.studentsForm}
              onUpdate={ob.updateStudents}
              students={ob.students}
              onAddStudent={ob.addStudent}
              onRemoveStudent={ob.removeStudent}
              parents={ob.parents}
              onAddParent={ob.addParent}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t">
            <Button variant="outline" onClick={ob.handleBack} disabled={ob.currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {ob.currentStep < ob.totalSteps ? (
              <Button onClick={ob.handleNext}>
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={ob.handleFinish}>
                Concluir Configuração
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
