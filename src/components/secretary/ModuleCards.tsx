import { Users, GraduationCap, School, Link2, CreditCard, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function ModuleCards() {
  const modules = [
    {
      icon: Users,
      title: "Students",
      description: "Manage student records and information",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/secretary/students",
    },
    {
      icon: School,
      title: "Classes",
      description: "Create and organize school classes",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      href: "/secretary/classes",
    },
    {
      icon: GraduationCap,
      title: "Teachers",
      description: "Register and manage teachers",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      href: "/secretary/teachers",
    },
    {
      icon: Link2,
      title: "Assignments",
      description: "Link teachers and students to classes",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/secretary/assignments",
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Manage tuition and generate invoices",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      href: "/secretary/financial",
    },
    {
      icon: FileCheck,
      title: "Authorizations",
      description: "Manage dismissals and field trips",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      href: "/secretary/authorizations",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <Link key={module.title} href={module.href}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-lg ${module.iconBg} flex items-center justify-center mb-4`}>
                <module.icon className={`w-6 h-6 ${module.iconColor}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
