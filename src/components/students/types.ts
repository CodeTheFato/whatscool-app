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
