"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Edit
} from "lucide-react"

export default function SchoolDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const schoolId = params.id

  // Mock data - em produção viria de uma API
  const school = {
    id: schoolId,
    name: "Colégio Bosque Azul",
    city: "Belo Horizonte",
    state: "MG",
    address: "Rua das Flores, 123 - Centro",
    cep: "30110-010",
    email: "contato@bosqueazul.edu.br",
    phone: "+55 31 3333-4444",
    cnpj: "12.345.678/0001-90",
    students: 324,
    teachers: 28,
    classes: 12,
    status: "active",
    createdAt: "2025-01-15",
    schoolType: "Privada",
  }

  const stats = [
    { label: "Alunos", value: school.students, icon: GraduationCap, color: "text-green-600 bg-green-100" },
    { label: "Professores", value: school.teachers, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Turmas", value: school.classes, icon: BookOpen, color: "text-purple-600 bg-purple-100" },
  ]

  const recentClasses = [
    { name: "1º Ano A", students: 28, teacher: "Maria Silva" },
    { name: "2º Ano B", students: 25, teacher: "João Santos" },
    { name: "3º Ano A", students: 30, teacher: "Ana Costa" },
  ]

  const recentActivities = [
    { date: "07/02/2026", activity: "Nova matrícula - Pedro Silva" },
    { date: "06/02/2026", activity: "Atualização de dados - Turma 2º Ano A" },
    { date: "05/02/2026", activity: "Novo professor cadastrado - Carlos Eduardo" },
  ]

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/schools">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{school.name}</h1>
              <Badge variant={school.status === "active" ? "default" : "secondary"}>
                {school.status === "active" ? "Ativa" : "Pendente"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {school.city} - {school.state}
            </p>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="classes">Turmas</TabsTrigger>
          <TabsTrigger value="activity">Atividades</TabsTrigger>
        </TabsList>

        {/* Tab: Informações */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Escola</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{school.schoolType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium">{school.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground ml-6">CEP:</span>
                  <span className="font-medium">{school.cep}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span className="font-medium">{school.cnpj}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="font-medium">{school.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{school.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cadastrada em:</span>
                  <span className="font-medium">{new Date(school.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Turmas */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Turmas Ativas</CardTitle>
              <CardDescription>
                Lista de turmas cadastradas nesta escola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentClasses.map((classe, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{classe.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Professor: {classe.teacher}
                      </p>
                    </div>
                    <Badge variant="outline">{classe.students} alunos</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Atividades */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Histórico de movimentações desta escola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
