"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Home,
  Users,
  GraduationCap,
  School,
  DollarSign,
  FileText,
  CheckCircle,
  Star,
  Calendar,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { sidebarMenus, type UserRole } from "@/config/sidebar-menus"

const iconMap = {
  Home,
  Users,
  GraduationCap,
  School,
  DollarSign,
  FileText,
  CheckCircle,
  Star,
  Calendar,
  Building2,
  MessageSquare,
  BarChart3,
  Settings
}

const roleColors = {
  admin: "bg-orange-100 text-orange-700 border-orange-200",
  secretary: "bg-blue-100 text-blue-700 border-blue-200",
  teacher: "bg-green-100 text-green-700 border-green-200",
  parents: "bg-purple-100 text-purple-700 border-purple-200",
  student: "bg-pink-100 text-pink-700 border-pink-200",
}

const roleLabels = {
  admin: "Administrador",
  secretary: "Secretaria",
  teacher: "Professor",
  parents: "Responsável",
  student: "Aluno",
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { data: session, status } = useSession()
  const isCollapsed = state === "collapsed"
  const isLoading = status === "loading"

  // Determine user role from pathname
  const getUserRole = (): UserRole | null => {
    if (pathname.startsWith("/admin")) return "admin"
    if (pathname.startsWith("/secretary")) return "secretary"
    if (pathname.startsWith("/teacher")) return "teacher"
    if (pathname.startsWith("/parents")) return "parents"
    if (pathname.startsWith("/student")) return "student"
    return null
  }

  const userRole = getUserRole()
  const menuItems = userRole ? sidebarMenus[userRole] : []

  return (
    <Sidebar collapsible="icon" className="border-r transition-all duration-300 ease-in-out">
      {/* Header */}
      <SidebarHeader className={`border-b py-5 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"
        }`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
          }`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 transition-all duration-300">
            <School className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Whatscool
              </h2>
              <p className="text-xs text-muted-foreground">Gestão Escolar</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className={`py-4 transition-all duration-300 ${isCollapsed ? "px-1" : "px-2"
        }`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <TooltipProvider delayDuration={0}>
                {menuItems.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap]
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                  const menuButton = (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-11 group hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCollapsed ? "px-0 justify-center" : "px-3"
                        }`}
                    >
                      <Link href={item.href} className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
                        }`}>
                        {Icon && <Icon className={`h-5 w-5 shrink-0 transition-all duration-300 ease-out ${isCollapsed ? "group-hover:scale-125 group-hover:rotate-6 group-hover:text-blue-600" : ""
                          }`} />}
                        {!isCollapsed && (
                          <span className="font-medium animate-in fade-in slide-in-from-left-1 duration-200">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )

                  return (
                    <SidebarMenuItem key={item.href}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {menuButton}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        menuButton
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-3 transition-all duration-300">
        {isLoading ? (
          <div className={`flex items-center rounded-lg bg-accent/50 p-2 ${isCollapsed ? "justify-center" : "gap-3"
            }`}>
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            )}
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center rounded-lg bg-accent/50 p-2 transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"
                  }`}>
                  <Avatar className="h-10 w-10 shrink-0 border-2 border-background transition-all duration-300">
                    <AvatarImage src={session?.user?.avatar || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm">
                      {session?.user?.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
                      <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                      {userRole && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${roleColors[userRole]}`}
                        >
                          {roleLabels[userRole]}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <div className="space-y-1">
                    <p className="font-semibold">{session?.user?.name}</p>
                    {userRole && (
                      <p className="text-xs text-muted-foreground">{roleLabels[userRole]}</p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
