import { NextRequest } from "next/server"
import { requireAuth, requireRole, handleApiError, success, created } from "@/lib/api"
import { UserService } from "@/lib/services/user.service"

export async function GET() {
  try {
    const user = await requireAuth()
    const users = await UserService.list(user.schoolId)
    return success(users)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar usuários")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const body = await request.json()
    const result = await UserService.create(user.schoolId, body)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao criar usuário")
  }
}
