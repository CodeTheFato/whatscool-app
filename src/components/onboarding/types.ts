export interface TeacherEntry {
  name: string
  email: string
  status: string
}

export interface StudentEntry {
  id: string
  name: string
  class: string
}

export interface ParentEntry {
  name: string
  email: string
  whatsapp: string
  status: string
}

export interface SchoolFormState {
  schoolName: string
  cnpj: string
  city: string
  state: string
  whatsapp: string
}

export interface UsersFormState {
  secretaryName: string
  secretaryEmail: string
  newTeacherName: string
  newTeacherEmail: string
}

export interface StudentsFormState {
  newStudentName: string
  newStudentClass: string
}
