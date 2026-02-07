"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"

export default function AdminDashboard() {
  // Mock data - Admin gerencia múltiplas escolas
  const schools = [
    {
      id: 1,
      name: "Colégio Bosque Azul",
      city: "Belo Horizonte",
      state: "MG",
      students: 324,
      teachers: 28,
      classes: 12,
      status: "active",
    },
    {
      id: 2,
      name: "Escola Villa Lobos",
      city: "São Paulo",
      state: "SP",
      students: 486,
      teachers: 35,
      classes: 18,
      status: "active",
    },
    {
      id: 3,
      name: "Instituto Educacional Santos",
      city: "Rio de Janeiro",
      state: "RJ",
      students: 215,
      teachers: 22,
      classes: 9,
      status: "pending",
    },
  ]

  const totalStats = {
    schools: schools.length,
    students: schools.reduce((acc, s) => acc + s.students, 0),
    teachers: schools.reduce((acc, s) => acc + s.teachers, 0),
    classes: schools.reduce((acc, s) => acc + s.classes, 0),
  }

  const recentActivities = [
    {
      type: "success",
      icon: CheckCircle2,
      title: "Nova escola cadastrada",
      message: "Instituto Educacional Santos - RJ",
      time: "há 2 horas"
    },
    {
      type: "info",
      icon: Clock,
      title: "Atualização de dados",
      message: "Colégio Bosque Azul atualizou informações",
      time: "há 5 horas"
    },
    {
      type: "warning",
      icon: AlertCircle,
      title: "Atenção necessária",
      message: "Escola Villa Lobos com pagamento pendente",
      time: "há 1 dia"
    },
  ]

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral de todas as instituições gerenciadas
          </p>
        </div>
        <Link href="/admin/schools/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Escola
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Escolas
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.schools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de instituições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alunos
            </CardTitle>
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.students}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Professores
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.teachers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Corpo docente ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turmas
            </CardTitle>
            <div className="p-2 rounded-full bg-orange-100 text-orange-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.classes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Turmas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>Escolas Gerenciadas</CardTitle>
          <CardDescription>
            Todas as instituições cadastradas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.map((school) => (
              <Link key={school.id} href={`/admin/schools/${school.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {school.city} - {school.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{school.students}</p>
                      <p className="text-xs text-muted-foreground">Alunos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{school.teachers}</p>
                      <p className="text-xs text-muted-foreground">Professores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{school.classes}</p>
                      <p className="text-xs text-muted-foreground">Turmas</p>
                    </div>
                    <Badge
                      variant={school.status === "active" ? "default" : "secondary"}
                    >
                      {school.status === "active" ? "Ativa" : "Pendente"}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Últimas movimentações na plataforma
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
    </main>
  )
}
