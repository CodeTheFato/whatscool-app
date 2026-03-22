import { Badge } from "@/components/ui/badge"

const STUDENT_STATUSES: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Ativo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  INACTIVE: {
    label: "Inativo",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
  TRANSFERRED: {
    label: "Transferido",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  GRADUATED: {
    label: "Formado",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
}

const TEACHER_STATUSES: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Ativo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  ON_LEAVE: {
    label: "Afastado",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  INACTIVE: {
    label: "Inativo",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
}

export function getStudentStatusBadge(status: string) {
  const config = STUDENT_STATUSES[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}

export function getTeacherStatusBadge(status: string) {
  const config = TEACHER_STATUSES[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
