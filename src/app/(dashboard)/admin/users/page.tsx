"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Trash2, Edit, Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AddUserModal } from "@/components/admin/users/AddUserModal"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u.id))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "SECRETARY":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "TEACHER":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "PARENT":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "STUDENT":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Administrador",
      SECRETARY: "Secretário",
      TEACHER: "Professor",
      PARENT: "Responsável",
      STUDENT: "Aluno",
    }
    return labels[role] || role
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleUserAdded = () => {
    fetchUsers()
    setIsAddModalOpen(false)
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-2">Gerenciar usuários da escola</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground mt-2">Gerenciar usuários da escola</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="SECRETARY">Secretário</SelectItem>
              <SelectItem value="TEACHER">Professor</SelectItem>
              <SelectItem value="PARENT">Responsável</SelectItem>
              <SelectItem value="STUDENT">Aluno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Table Container */}
      {filteredUsers.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg">
          {/* Bulk Actions */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Checkbox checked={selectedUsers.length === filteredUsers.length} onCheckedChange={toggleAll} />
              <span className="text-sm text-muted-foreground">Selecionar todos</span>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedUsers.length} selecionado(s)</span>
                <Button variant="secondary" size="sm">
                  Desativar
                </Button>
                <Button variant="destructive" size="sm">
                  Excluir
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12"></th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Telefone</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleUser(user.id)} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                    </td>
                    <td className="p-4 text-sm">{user.phone || "-"}</td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={
                          user.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-accent rounded transition-colors text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-accent rounded transition-colors text-orange-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-accent rounded transition-colors text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Anterior
            </Button>

            <Button variant={currentPage === 1 ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(1)}>
              1
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => p + 1)}>
              Próximo
            </Button>
          </div>
        </div>
      )}

      <AddUserModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onUserAdded={handleUserAdded} />
    </main>
  )
}
