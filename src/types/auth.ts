export type UserRole = 'ADMIN' | 'SECRETARY' | 'TEACHER' | 'PARENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  schoolId?: string
  schoolName?: string
}

export interface InviteData {
  token: string
  email: string
  role: UserRole
  schoolId: string
  schoolName: string
}

export interface ActivationFormData {
  name: string
  password: string
  confirmPassword: string
}
