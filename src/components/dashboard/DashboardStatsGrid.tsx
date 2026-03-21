import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export interface StatCard {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  color: string
  href?: string
}

interface DashboardStatsGridProps {
  stats: StatCard[]
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const card = (
          <Card className={stat.href ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )

        if (stat.href) {
          return (
            <Link key={stat.title} href={stat.href}>
              {card}
            </Link>
          )
        }

        return <div key={stat.title}>{card}</div>
      })}
    </div>
  )
}
