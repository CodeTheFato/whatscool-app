import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Building2,
  ChevronRight,
  Plus,
  Search,
  MapPin,
  Users,
  GraduationCap
} from "lucide-react"

export default function AdminSchoolsPage() {
  // Mock data
  const schools = [
    {
      id: 1,
      name: "Colégio Bosque Azul",
      city: "Belo Horizonte",
      state: "MG",
      address: "Rua das Flores, 123",
      students: 324,
      teachers: 28,
      classes: 12,
      status: "active",
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      name: "Escola Villa Lobos",
      city: "São Paulo",
      state: "SP",
      address: "Av. Paulista, 1000",
      students: 486,
      teachers: 35,
      classes: 18,
      status: "active",
      createdAt: "2024-08-20",
    },
    {
      id: 3,
      name: "Instituto Educacional Santos",
      city: "Rio de Janeiro",
      state: "RJ",
      address: "Rua Copacabana, 456",
      students: 215,
      teachers: 22,
      classes: 9,
      status: "pending",
      createdAt: "2026-02-01",
    },
    {
      id: 4,
      name: "Centro Educacional Horizonte",
      city: "Curitiba",
      state: "PR",
      address: "Rua XV de Novembro, 789",
      students: 298,
      teachers: 26,
      classes: 11,
      status: "active",
      createdAt: "2024-11-10",
    },
  ]

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === "active").length,
    pending: schools.filter(s => s.status === "pending").length,
    totalStudents: schools.reduce((acc, s) => acc + s.students, 0),
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escolas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escolas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade ou estado..."
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Schools List */}
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
                      <Badge
                        variant={school.status === "active" ? "default" : "secondary"}
                      >
                        {school.status === "active" ? "Ativa" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.city} - {school.state}
                      </span>
                      <span>{school.address}</span>
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{school.students}</span> alunos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{school.teachers}</span> professores
                      </span>
                      <span className="text-muted-foreground">
                        {school.classes} turmas
                      </span>
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
    </main>
  )
}
