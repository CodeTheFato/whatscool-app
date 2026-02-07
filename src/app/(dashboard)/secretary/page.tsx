import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  ChevronRight,
  School,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare
} from "lucide-react"

export default function SecretaryDashboard() {
  // Mock data
  const school = {
    name: "Colégio Bosque Azul",
    city: "Belo Horizonte",
    state: "MG",
  }

  const stats = [
    {
      title: "Turmas",
      value: 12,
      description: "Total de turmas ativas",
      icon: BookOpen,
      href: "/secretary/classes",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Alunos",
      value: 324,
      description: "Matriculados este ano",
      icon: GraduationCap,
      href: "/secretary/students",
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Responsáveis",
      value: 520,
      description: "Cadastrados no sistema",
      icon: UserCheck,
      href: "/parents",
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Professores",
      value: 28,
      description: "Corpo docente ativo",
      icon: Users,
      href: "/secretary/teachers",
      color: "text-orange-600 bg-orange-100",
    },
  ]

  const recentActivities = [
    {
      type: "success",
      icon: CheckCircle2,
      title: "Novo aluno matriculado",
      message: "Maria Santos - 2º Ano A",
      time: "há 2 horas"
    },
    {
      type: "info",
      icon: DollarSign,
      title: "Pagamento confirmado",
      message: "Mensalidade de Pedro Silva",
      time: "há 5 horas"
    },
    {
      type: "warning",
      icon: MessageSquare,
      title: "Nova comunicação",
      message: "Reunião de pais - 3º Ano",
      time: "há 1 dia"
    },
  ]

  const pendingAuthorizations = [
    { student: "João Pedro Costa", action: "Transferência de turma", date: "05/02/2026" },
    { student: "Ana Paula Santos", action: "Atestado médico", date: "04/02/2026" },
    { student: "Carlos Eduardo Silva", action: "Justificativa de falta", date: "03/02/2026" },
  ]

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Painel da Secretaria</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Veja o que está acontecendo hoje.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas movimentações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`p-2 rounded-full ${activity.type === "success" ? "bg-green-100 text-green-600" :
                        activity.type === "warning" ? "bg-yellow-100 text-yellow-600" :
                          "bg-blue-100 text-blue-600"
                      }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Authorizations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Autorizações Pendentes</CardTitle>
                <CardDescription>
                  Solicitações aguardando aprovação
                </CardDescription>
              </div>
              <Badge variant="secondary">{pendingAuthorizations.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAuthorizations.map((auth, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{auth.student}</p>
                    <p className="text-sm text-muted-foreground">{auth.action}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {auth.date}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Revisar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/secretary/students">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <GraduationCap className="h-6 w-6" />
                <span className="text-xs">Gerenciar Alunos</span>
              </Button>
            </Link>
            <Link href="/secretary/classes">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-xs">Gerenciar Turmas</span>
              </Button>
            </Link>
            <Link href="/secretary/teachers">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Users className="h-6 w-6" />
                <span className="text-xs">Gerenciar Professores</span>
              </Button>
            </Link>
            <Link href="/secretary/financial">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <DollarSign className="h-6 w-6" />
                <span className="text-xs">Financeiro</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
