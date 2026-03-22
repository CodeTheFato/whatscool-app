export type StudentsRole = "secretary" | "teacher"

export type SortField = "name" | "class" | "registrationId"
export type SortDirection = "asc" | "desc"

export interface StudentRow {
  id: string
  name: string
  email: string
  phone?: string | null
  registrationId: string
  class: string | null
  parents: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    kinship: string
    isActive: boolean
  }>
  status: string
  isActive: boolean
  dateOfBirth?: string
  createdAt?: string
}

export interface StudentsConfig {
  role: StudentsRole
  pageTitle: string
  pageDescription: string
  basePath: string
  canCreate: boolean
  canImport: boolean
  canSelect: boolean
  canEdit: boolean
  showStats: boolean
}

// ─── Form types ────────────────────────────────────

export interface StudentFormState {
  studentName: string
  studentEmail: string
  studentPhone: string
  dateOfBirth: string
  cpf: string
  registrationId: string
  classId: string
  status: string
  // Parent 1
  parent1Id: string
  parent1Name: string
  parent1Email: string
  parent1Phone: string
  parent1Kinship: string
  parent1Cpf: string
  // Parent 2
  parent2Id: string
  parent2Name: string
  parent2Email: string
  parent2Phone: string
  parent2Kinship: string
  parent2Cpf: string
  // Additional
  healthInfo: string
  observations: string
}

export interface StudentDetail {
  id: string
  userId: string
  name: string
  email: string
  phone: string | null
  registrationId: string
  dateOfBirth: string | null
  cpf: string | null
  healthInfo: string | null
  status: string
  isActive: boolean
  classId: string | null
  className: string | null
  parents: Array<{
    id: string
    userId: string
    name: string
    email: string
    phone: string | null
    kinship: string
    cpf: string | null
    isActive: boolean
  }>
  createdAt: string
  updatedAt: string
}

export interface ClassOption {
  id: string
  name: string
}
