export type UserRole = 'secretary' | 'teacher' | 'parents' | 'student'

export interface MenuItem {
  label: string
  href: string
  icon: string
}

export const sidebarMenus: Record<UserRole, MenuItem[]> = {
  secretary: [
    { label: 'Dashboard', href: '/secretary', icon: 'Home' },
    { label: 'School', href: '/secretary/school', icon: 'Building2' },
    { label: 'Students', href: '/secretary/students', icon: 'Users' },
    { label: 'Teachers', href: '/secretary/teachers', icon: 'GraduationCap' },
    { label: 'Classes', href: '/secretary/classes', icon: 'School' },
    { label: 'Financial', href: '/secretary/financial', icon: 'DollarSign' },
    { label: 'Communication', href: '/secretary/communication', icon: 'MessageSquare' },
  ],
  teacher: [
    { label: 'Dashboard', href: '/teacher', icon: 'Home' },
    { label: 'Classes', href: '/teacher/classes', icon: 'School' },
    { label: 'Activities', href: '/teacher/activities', icon: 'FileText' },
    { label: 'Grades', href: '/teacher/grades', icon: 'CheckCircle' },
  ],
  parents: [
    { label: 'Dashboard', href: '/parents', icon: 'Home' },
    { label: 'Children', href: '/parents/children', icon: 'Users' },
    { label: 'Grades', href: '/parents/grades', icon: 'FileText' },
    { label: 'Financial', href: '/parents/financial', icon: 'DollarSign' },
  ],
  student: [
    { label: 'Dashboard', href: '/student', icon: 'Home' },
    { label: 'Activities', href: '/student/activities', icon: 'FileText' },
    { label: 'Grades', href: '/student/grades', icon: 'Star' },
    { label: 'Schedule', href: '/student/schedule', icon: 'Calendar' },
  ],
}
