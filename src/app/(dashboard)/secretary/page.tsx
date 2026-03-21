import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Clock,
  MessageSquare,
} from "lucide-react"
import { DashboardStatsGrid, ActivityFeed } from "@/components/dashboard"
import type { StatCard, ActivityItem } from "@/components/dashboard"

export default function SecretaryDashboard() {
  const stats: StatCard[] = [
    { title: "Turmas", value: 12, description: "Total de turmas ativas", icon: BookOpen, color: "text-blue-600 bg-blue-100", href: "/secretary/classes" },
    { title: "Alunos", value: 324, description: "Matriculados este ano", icon: GraduationCap, color: "text-green-600 bg-green-100", href: "/secretary/students" },
    { title: "Responsáveis", value: 520, description: "Cadastrados no sistema", icon: UserCheck, color: "text-purple-600 bg-purple-100", href: "/parents" },
    { title: "Professores", value: 28, description: "Corpo docente ativo", icon: Users, color: "text-orange-600 bg-orange-100", href: "/secretary/teachers" },
  ]

  const recentActivities: ActivityItem[] = [
    { type: "success", icon: CheckCircle2, title: "Novo aluno matriculado", message: "Maria Santos - 2º Ano A", time: "há 2 horas" },
    { type: "info", icon: DollarSign, title: "Pagamento confirmado", message: "Mensalidade de Pedro Silva", time: "há 5 horas" },
    { type: "warning", icon: MessageSquare, title: "Nova comunicação", message: "Reunião de pais - 3º Ano", time: "há 1 dia" },
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

      <DashboardStatsGrid stats={stats} />

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityFeed
          title="Atividades Recentes"
          description="Últimas movimentações do sistema"
          activities={recentActivities}
        />

        {/* Pending Authorizations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Autorizações Pendentes</CardTitle>
                <CardDescription>Solicitações aguardando aprovação</CardDescription>
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
          <CardDescription>Acesse as principais funcionalidades</CardDescription>
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
