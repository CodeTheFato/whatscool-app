export interface SchoolFormData {
  schoolName: string
  taxId?: string
  schoolType?: string
  studentCount?: string
  city: string
  state: string
  mainEmail: string
  officePhone: string
  whatsapp: string
  whatsappType: string
  timezone: string
  responsibleName: string
  role?: string
  loginEmail: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export interface School {
  id: string
  name: string
  cnpj: string | null
  schoolType: string | null
  studentCount: string | null
  address: string
  city: string
  state: string
  zipCode: string
  email: string
  phone: string
  whatsapp: string | null
  whatsappType: string | null
  timezone: string
  logo: string | null
  createdAt: string
  updatedAt: string
}

export interface SchoolWithCounts extends School {
  _count: {
    students: number
    teachers: number
    classes: number
    users: number
  }
}

export interface SchoolsResponse {
  schools: School[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateSchoolResponse {
  message: string
  school: {
    id: string
    name: string
    email: string
  }
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface UpdateSchoolResponse {
  message: string
  school: School
}

export interface DeleteSchoolResponse {
  message: string
}

export interface SchoolErrorResponse {
  error: string
  details?: {
    students?: number
    teachers?: number
    classes?: number
  }
}
