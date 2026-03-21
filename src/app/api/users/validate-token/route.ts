import { NextRequest } from "next/server"
import { handleApiError, success } from "@/lib/api"
import { UserService } from "@/lib/services/user.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await UserService.validateToken(body)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao validar token")
  }
}
