"use client"

import { useState, useEffect } from "react"
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
  AlertCircle,
} from "lucide-react"
import { DashboardStatsGrid, ActivityFeed } from "@/components/dashboard"
import type { StatCard, ActivityItem } from "@/components/dashboard"

interface School {
  id: string
  name: string
  city: string
  state: string
  email: string
  phone: string
  createdAt: string
  _count?: {
    students: number
    teachers: number
    classes: number
  }
}

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/schools")
      if (response.ok) {
        const data = await response.json()
        setSchools(data.schools || [])
      }
    } catch (error) {
      console.error("Error fetching schools:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalStats = {
    schools: schools.length,
    students: schools.reduce((acc, s) => acc + (s._count?.students || 0), 0),
    teachers: schools.reduce((acc, s) => acc + (s._count?.teachers || 0), 0),
    classes: schools.reduce((acc, s) => acc + (s._count?.classes || 0), 0),
  }

  const stats: StatCard[] = [
    { title: "Escolas", value: totalStats.schools, description: "Total de instituições", icon: Building2, color: "text-blue-600 bg-blue-100" },
    { title: "Alunos", value: totalStats.students, description: "Total na plataforma", icon: GraduationCap, color: "text-green-600 bg-green-100" },
    { title: "Professores", value: totalStats.teachers, description: "Corpo docente ativo", icon: Users, color: "text-purple-600 bg-purple-100" },
    { title: "Turmas", value: totalStats.classes, description: "Turmas ativas", icon: TrendingUp, color: "text-orange-600 bg-orange-100" },
  ]

  const recentActivities: ActivityItem[] = [
    { type: "success", icon: CheckCircle2, title: "Nova escola cadastrada", message: "Instituto Educacional Santos - RJ", time: "há 2 horas" },
    { type: "info", icon: Clock, title: "Atualização de dados", message: "Colégio Bosque Azul atualizou informações", time: "há 5 horas" },
    { type: "warning", icon: AlertCircle, title: "Atenção necessária", message: "Escola Villa Lobos com pagamento pendente", time: "há 1 dia" },
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

      <DashboardStatsGrid stats={stats} />

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>Escolas Gerenciadas</CardTitle>
          <CardDescription>Todas as instituições cadastradas na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma escola cadastrada ainda.</p>
            </div>
          ) : (
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
                        <p className="text-2xl font-bold">{school._count?.students || 0}</p>
                        <p className="text-xs text-muted-foreground">Alunos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{school._count?.teachers || 0}</p>
                        <p className="text-xs text-muted-foreground">Professores</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{school._count?.classes || 0}</p>
                        <p className="text-xs text-muted-foreground">Turmas</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Ativa
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ActivityFeed
        title="Atividades Recentes"
        description="Últimas movimentações na plataforma"
        activities={recentActivities}
      />
    </main>
  )
}
