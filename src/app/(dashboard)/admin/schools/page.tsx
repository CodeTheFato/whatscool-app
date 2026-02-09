"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Building2,
  ChevronRight,
  Plus,
  Search,
  MapPin,
  Users,
  GraduationCap
} from "lucide-react"
import { toast } from "sonner"

interface School {
  id: string
  name: string
  city: string
  state: string
  address: string | null
  email: string
  phone: string
  cnpj: string | null
  schoolType: string | null
  studentCount: string | null
  createdAt: string
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/schools?search=${search}`)

      if (!response.ok) {
        throw new Error("Erro ao buscar escolas")
      }

      const data = await response.json()
      setSchools(data.schools)
    } catch (error) {
      toast.error("Erro ao carregar escolas")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSchools()
  }

  const stats = {
    total: schools.length,
    totalStudents: schools.reduce((acc, s) => {
      const count = s.studentCount ? parseInt(s.studentCount) : 0
      return acc + count
    }, 0),
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Escolas</h1>
          <p className="text-muted-foreground">
            Todas as instituições cadastradas na plataforma
          </p>
        </div>
        <Link href="/admin/schools/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Escola
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escolas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade ou estado..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>
        </CardHeader>
      </Card>

      {/* Schools List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : schools.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma escola encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "Tente buscar com outros termos" : "Comece cadastrando sua primeira escola"}
            </p>
            {!search && (
              <Link href="/admin/schools/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Escola
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schools.map((school) => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{school.name}</h3>
                        {school.schoolType && (
                          <Badge variant="secondary">
                            {school.schoolType === "public" && "Pública"}
                            {school.schoolType === "private" && "Privada"}
                            {school.schoolType === "mixed" && "Mista"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {school.city} - {school.state}
                        </span>
                        {school.address && <span>{school.address}</span>}
                      </div>
                      <div className="flex items-center gap-6 mt-2 text-sm">
                        {school.studentCount && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{school.studentCount}</span> alunos
                          </span>
                        )}
                        {school.cnpj && (
                          <span className="text-muted-foreground">
                            CNPJ: {school.cnpj}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/schools/${school.id}`}>
                      <Button variant="outline">
                        Ver Detalhes
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
