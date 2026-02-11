export type UserRole = 'admin' | 'secretary' | 'teacher' | 'parents' | 'student'

export interface MenuItem {
  label: string
  href: string
  icon: string
}

export const sidebarMenus: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: 'Painel', href: '/admin', icon: 'Home' },
    { label: 'Escolas', href: '/admin/schools', icon: 'Building2' },
    { label: 'Usuários', href: '/admin/users', icon: 'Users' },
    { label: 'Relatórios', href: '/admin/reports', icon: 'BarChart3' },
    { label: 'Configurações', href: '/admin/settings', icon: 'Settings' },
  ],
  secretary: [
    { label: 'Painel', href: '/secretary', icon: 'Home' },
    { label: 'Alunos', href: '/secretary/students', icon: 'Users' },
    { label: 'Professores', href: '/secretary/teachers', icon: 'GraduationCap' },
    { label: 'Turmas', href: '/secretary/classes', icon: 'School' },
    { label: 'Financeiro', href: '/secretary/financial', icon: 'DollarSign' },
    { label: 'Comunicação', href: '/secretary/communication', icon: 'MessageSquare' },
  ],
  teacher: [
    { label: 'Painel', href: '/teacher', icon: 'Home' },
    { label: 'Turmas', href: '/teacher/classes', icon: 'School' },
    { label: 'Atividades', href: '/teacher/activities', icon: 'FileText' },
    { label: 'Notas', href: '/teacher/grades', icon: 'CheckCircle' },
  ],
  parents: [
    { label: 'Painel', href: '/parents', icon: 'Home' },
    { label: 'Filhos', href: '/parents/children', icon: 'Users' },
    { label: 'Mensagens', href: '/parents/messages', icon: 'MessageSquare' },
    { label: 'Notas', href: '/parents/grades', icon: 'FileText' },
    { label: 'Financeiro', href: '/parents/financial', icon: 'DollarSign' },
  ],
  student: [
    { label: 'Painel', href: '/student', icon: 'Home' },
    { label: 'Atividades', href: '/student/activities', icon: 'FileText' },
    { label: 'Notas', href: '/student/grades', icon: 'Star' },
    { label: 'Horário', href: '/student/schedule', icon: 'Calendar' },
  ],
}
