"use client"

import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, User, Settings, LogOut, School } from "lucide-react"
import { toast } from "sonner"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isLoading = status === "loading"

  function getRoleFromPath(path: string) {
    if (path.startsWith("/admin")) return "Administrador"
    if (path.startsWith("/secretary")) return "Secretaria"
    if (path.startsWith("/teacher")) return "Professor"
    if (path.startsWith("/parents")) return "Responsável"
    if (path.startsWith("/student")) return "Aluno"
    return "Usuário"
  }

  const isAdmin = session?.user?.role === "ADMIN"

  const handleLogout = () => {
    toast.success("Logout realizado com sucesso!")
    router.push("/login")
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center justify-between">
        {/* School Info */}
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="hidden md:flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ) : !isAdmin && session?.user?.schoolName ? (
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            <div className="hidden md:block">
              <p className="text-sm font-semibold">{session.user.schoolName}</p>
              <p className="text-xs text-muted-foreground">{getRoleFromPath(pathname)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{getRoleFromPath(pathname)}</p>
          </div>
        )}

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isLoading ? (
                <Button variant="ghost" className="relative h-10 gap-2 px-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="hidden md:flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </Button>
              ) : (
                <Button variant="ghost" className="relative h-10 gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.avatar || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="bg-primary text-white">
                      {session?.user?.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">{session?.user?.name}</span>
                    <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                  </div>
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {getRoleFromPath(pathname)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
