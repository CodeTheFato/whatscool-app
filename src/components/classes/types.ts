export type ClassesRole = "secretary" | "teacher"

export interface ClassItem {
  id: string
  name: string
  grade: string
  shift: string
  academicYear: number
  maxStudents: number
  currentStudents: number
  teacher: {
    id: string
    name: string
  } | null
  createdAt: string
}

export interface ClassesConfig {
  role: ClassesRole
  pageTitle: string
  pageDescription: string
  canCreate: boolean
  canSelect: boolean
}
