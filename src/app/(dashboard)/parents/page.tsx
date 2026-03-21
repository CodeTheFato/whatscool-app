import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { ActivityFeed } from "@/components/dashboard"
import type { ActivityItem } from "@/components/dashboard"

export default function ParentsDashboard() {
  const user = {
    name: "Ana Paula Costa",
    email: "ana@email.com",
  }

  const financialStatus = {
    currentMonth: "Fevereiro 2026",
    status: "Em dia",
    nextDueDate: "10/03/2026",
    value: "R$ 850,00",
  }

  const children = [
    {
      id: 1,
      name: "Lucas Costa",
      class: "2º Ano A",
      avatar: "",
      attendance: 95,
      pendingActivities: 2,
      nextEvent: "Reunião de Pais - 15/03",
    },
    {
      id: 2,
      name: "Julia Costa",
      class: "5º Ano B",
      avatar: "",
      attendance: 98,
      pendingActivities: 0,
      nextEvent: "Prova de Matemática - 12/03",
    },
  ]

  const recentNotifications: ActivityItem[] = [
    { type: "info", icon: FileText, title: "Nova atividade disponível", message: "Lucas - Matemática: Exercícios sobre frações", time: "há 3 horas" },
    { type: "warning", icon: Clock, title: "Reunião agendada", message: "Reunião de pais - 2º Ano A em 15/03", time: "há 1 dia" },
    { type: "success", icon: CheckCircle2, title: "Pagamento confirmado", message: "Mensalidade de janeiro paga com sucesso", time: "há 2 dias" },
  ]

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bem-vinda, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos seus filhos
        </p>
      </div>

      {/* Financial Status Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Situação Financeira</CardTitle>
              <CardDescription>{financialStatus.currentMonth}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {financialStatus.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Próximo vencimento</p>
              <p className="text-lg font-semibold">{financialStatus.nextDueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-lg font-semibold">{financialStatus.value}</p>
            </div>
            <Link href="/parents/financial">
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Children Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Meus Filhos</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.avatar} alt={child.name} />
                    <AvatarFallback className="text-lg">
                      {child.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>{child.class}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Frequência</span>
                  <Badge variant={child.attendance >= 90 ? "default" : "destructive"}>
                    {child.attendance}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Atividades Pendentes</span>
                  <Badge variant={child.pendingActivities === 0 ? "outline" : "secondary"}>
                    {child.pendingActivities}
                  </Badge>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Próximo evento</p>
                  <p className="text-sm font-medium text-blue-900">{child.nextEvent}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link href={`/parents/grades?student=${child.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Notas
                    </Button>
                  </Link>
                  <Link href={`/student/schedule?student=${child.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Horário
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ActivityFeed
        title="Notificações Recentes"
        description="Últimas atualizações sobre seus filhos"
        activities={recentNotifications}
      />
    </main>
  )
}
