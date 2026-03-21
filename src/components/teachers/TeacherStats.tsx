"use client"

import { Users, GraduationCap, BookOpen } from "lucide-react"

interface TeacherStatsProps {
  totalTeachers: number
  totalClasses: number
  totalSubjects: number
  isLoading?: boolean
}

export function TeacherStats({ totalTeachers, totalClasses, totalSubjects, isLoading }: TeacherStatsProps) {
  const stats = [
    {
      label: "Total de professores",
      value: totalTeachers,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "Turmas vinculadas",
      value: totalClasses,
      icon: GraduationCap,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/50",
    },
    {
      label: "Disciplinas ensinadas",
      value: totalSubjects,
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-lg border bg-card p-4"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <div className="h-7 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
