"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  MessageSquare
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
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
  MessageSquare
}

export default function AppSidebar() {
  const pathname = usePathname()

  // Determine user role from pathname
  const getUserRole = (): UserRole | null => {
    if (pathname.startsWith("/secretary")) return "secretary"
    if (pathname.startsWith("/teacher")) return "teacher"
    if (pathname.startsWith("/parents")) return "parents"
    if (pathname.startsWith("/student")) return "student"
    return null
  }

  const userRole = getUserRole()
  const menuItems = userRole ? sidebarMenus[userRole] : []

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">WhatSchool</h2>
        {userRole && (
          <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap]
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
