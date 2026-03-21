import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApiError } from "./errors"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  schoolId: string
  phone: string | null
  isActive: boolean
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new ApiError(401, "Não autenticado")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    throw new ApiError(404, "Usuário não encontrado")
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    phone: user.phone,
    isActive: user.isActive,
  }
}

export async function requireRole(roles: string[]): Promise<AuthUser> {
  const user = await requireAuth()

  if (!roles.includes(user.role)) {
    throw new ApiError(403, "Sem permissão")
  }

  return user
}
