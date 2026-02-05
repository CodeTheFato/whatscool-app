import { Users, GraduationCap, School, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatsCards() {
  const stats = [
    {
      icon: Users,
      label: "Total Students",
      value: "342",
      change: "+12 this month",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: GraduationCap,
      label: "Teachers",
      value: "28",
      change: "Active",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: School,
      label: "Classes",
      value: "15",
      change: "All grades",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: DollarSign,
      label: "Monthly Revenue",
      value: "$171,000",
      change: "+8% vs last month",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
