export type UserRole = 'admin' | 'secretary' | 'teacher' | 'parents'

export interface MenuItem {
  label: string
  href: string
  icon: string
}

/**
 * Mapeia o role do banco (enum UserRole do Prisma) para o role da aplicação.
 * O banco usa "PARENT" (singular), as rotas usam "parents" (plural).
 */
export const dbRoleToAppRole: Record<string, UserRole> = {
  ADMIN: 'admin',
  SECRETARY: 'secretary',
  TEACHER: 'teacher',
  PARENT: 'parents',
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  secretary: 'Secretaria',
  teacher: 'Professor',
  parents: 'Responsável',
}

export const sidebarMenus: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: 'Painel', href: '/admin', icon: 'Home' },
    { label: 'Escolas', href: '/admin/schools', icon: 'Building2' },
    { label: 'Usuários', href: '/admin/users', icon: 'Users' },
  ],
  secretary: [
    { label: 'Painel', href: '/secretary', icon: 'Home' },
    { label: 'Alunos', href: '/secretary/students', icon: 'Users' },
    { label: 'Professores', href: '/secretary/teachers', icon: 'GraduationCap' },
    { label: 'Turmas', href: '/secretary/classes', icon: 'School' },
    { label: 'Comunicação', href: '/secretary/communication', icon: 'MessageSquare' },
  ],
  teacher: [
    { label: 'Painel', href: '/teacher', icon: 'Home' },
    { label: 'Alunos', href: '/teacher/students', icon: 'Users' },
    { label: 'Turmas', href: '/teacher/classes', icon: 'School' },
    { label: 'Comunicação', href: '/teacher/communication', icon: 'MessageSquare' },
  ],
  parents: [
    { label: 'Painel', href: '/parents', icon: 'Home' },
    { label: 'Filhos', href: '/parents/children', icon: 'Users' },
    { label: 'Comunicação', href: '/parents/messages', icon: 'MessageSquare' },
  ],
}
