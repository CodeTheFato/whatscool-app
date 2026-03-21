"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { UserRole } from "@/types/auth"
import type {
  TeacherEntry,
  StudentEntry,
  ParentEntry,
  SchoolFormState,
  UsersFormState,
  StudentsFormState,
} from "@/components/onboarding/types"

export function useOnboarding() {
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN")
  const [currentStep, setCurrentStep] = useState(1)

  const totalSteps = currentRole === "ADMIN" ? 3 : 2

  // Step 1 - School
  const [schoolForm, setSchoolForm] = useState<SchoolFormState>({
    schoolName: "",
    cnpj: "",
    city: "",
    state: "",
    whatsapp: "",
  })

  // Step 2 - Users
  const [usersForm, setUsersForm] = useState<UsersFormState>({
    secretaryName: "",
    secretaryEmail: "",
    newTeacherName: "",
    newTeacherEmail: "",
  })
  const [teachers, setTeachers] = useState<TeacherEntry[]>([])

  // Step 3 - Students
  const [studentsForm, setStudentsForm] = useState<StudentsFormState>({
    newStudentName: "",
    newStudentClass: "",
  })
  const [students, setStudents] = useState<StudentEntry[]>([])
  const [parents, setParents] = useState<Record<string, ParentEntry[]>>({})

  const updateSchool = (field: keyof SchoolFormState, value: string) => {
    setSchoolForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateUsers = (field: keyof UsersFormState, value: string) => {
    setUsersForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateStudents = (field: keyof StudentsFormState, value: string) => {
    setStudentsForm((prev) => ({ ...prev, [field]: value }))
  }

  const addTeacher = () => {
    if (usersForm.newTeacherName && usersForm.newTeacherEmail) {
      setTeachers((prev) => [
        ...prev,
        { name: usersForm.newTeacherName, email: usersForm.newTeacherEmail, status: "Convite enviado" },
      ])
      setUsersForm((prev) => ({ ...prev, newTeacherName: "", newTeacherEmail: "" }))
      toast.success("Professor adicionado!")
    }
  }

  const removeTeacher = (index: number) => {
    setTeachers((prev) => prev.filter((_, i) => i !== index))
  }

  const sendSecretaryInvite = () => {
    if (usersForm.secretaryName && usersForm.secretaryEmail) {
      toast.success("Convite enviado para a Secretaria!")
    }
  }

  const addStudent = () => {
    if (studentsForm.newStudentName && studentsForm.newStudentClass) {
      const id = `student-${Date.now()}`
      setStudents((prev) => [...prev, { id, name: studentsForm.newStudentName, class: studentsForm.newStudentClass }])
      setParents((prev) => ({ ...prev, [id]: [] }))
      setStudentsForm({ newStudentName: "", newStudentClass: "" })
      toast.success("Aluno adicionado!")
    }
  }

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setParents((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const addParent = (studentId: string, parent: Omit<ParentEntry, "status">) => {
    const current = parents[studentId] || []
    if (current.length >= 2) {
      toast.error("Um aluno pode ter no máximo 2 responsáveis")
      return
    }
    setParents((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), { ...parent, status: "Convite enviado" }],
    }))
    toast.success("Responsável adicionado!")
  }

  const handleNext = () => {
    if (currentStep === 1 && currentRole === "ADMIN") {
      if (!schoolForm.schoolName || !schoolForm.city || !schoolForm.state || !schoolForm.whatsapp) {
        toast.error("Preencha todos os campos obrigatórios")
        return
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    toast.success("Configuração inicial concluída!")
    const redirectPath = currentRole === "ADMIN" ? "/admin" : "/secretary"
    router.push(redirectPath)
  }

  return {
    currentRole,
    setCurrentRole,
    currentStep,
    totalSteps,
    schoolForm,
    updateSchool,
    usersForm,
    updateUsers,
    teachers,
    addTeacher,
    removeTeacher,
    sendSecretaryInvite,
    studentsForm,
    updateStudents,
    students,
    addStudent,
    removeStudent,
    parents,
    addParent,
    handleNext,
    handleBack,
    handleFinish,
  }
}
