export type TeachersRole = "secretary"

export type TeacherSortField = "name" | "classes"
export type SortDirection = "asc" | "desc"

export interface TeacherRow {
  id: string
  name: string
  email: string
  phone?: string | null
  registrationId?: string | null
  classes: string[]
  subjects: string[]
  status: string
  isActive: boolean
}

export interface TeachersConfig {
  role: TeachersRole
  pageTitle: string
  pageDescription: string
  basePath: string
  canCreate: boolean
  canImport: boolean
  canSelect: boolean
  canEdit: boolean
  showStats: boolean
}

export interface ClassTeacherAssignment {
  id: string
  classId: string
  subjectId: string
  role: "MAIN" | "SUBJECT" | "ASSISTANT"
}
