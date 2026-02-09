"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Skeleton } from "@/components/ui/skeleton"

interface School {
  id: string
  name: string
  city: string
  state: string
  address: string | null
  zipCode: string | null
  email: string
  phone: string
  cnpj: string | null
  schoolType: string | null
  createdAt: string
  _count: {
    students: number
    teachers: number
    classes: number
  }
}

export default function SchoolDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const schoolId = params.id as string

  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchool()
  }, [schoolId])

  const fetchSchool = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/schools/${schoolId}`)
      if (response.ok) {
        const data = await response.json()
        setSchool(data)
      } else {
        console.error("Failed to fetch school")
      }
    } catch (error) {
      console.error("Error fetching school:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </main>
    )
  }

  if (!school) {
    return (
      <main className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Escola não encontrada</p>
          <Link href="/admin/schools">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  const stats = [
    { label: "Alunos", value: school._count.students, icon: GraduationCap, color: "text-green-600 bg-green-100" },
    { label: "Professores", value: school._count.teachers, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Turmas", value: school._count.classes, icon: BookOpen, color: "text-purple-600 bg-purple-100" },
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
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Ativa
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

      {/* Informações da Escola */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Escola</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{school.schoolType || "Não informado"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Endereço:</span>
              <span className="font-medium">{school.address || "Não informado"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground ml-6">CEP:</span>
              <span className="font-medium">{school.zipCode || "Não informado"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">CNPJ:</span>
              <span className="font-medium">{school.cnpj || "Não informado"}</span>
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
    </main>
  )
}
