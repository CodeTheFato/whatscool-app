import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/types/auth"

interface RoleBadgeProps {
  role: UserRole
}

const roleConfig = {
  ADMIN: {
    label: 'Administrador',
    variant: 'default' as const,
    className: 'bg-blue-600 hover:bg-blue-700'
  },
  SECRETARY: {
    label: 'Secretaria',
    variant: 'secondary' as const,
    className: 'bg-purple-600 hover:bg-purple-700 text-white'
  },
  TEACHER: {
    label: 'Professor',
    variant: 'default' as const,
    className: 'bg-green-600 hover:bg-green-700'
  },
  PARENT: {
    label: 'Responsável',
    variant: 'outline' as const,
    className: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600'
  }
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role]

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
