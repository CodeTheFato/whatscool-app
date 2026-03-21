import { NextRequest } from "next/server"
import { handleApiError, success } from "@/lib/api"
import { UserService } from "@/lib/services/user.service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const result = await UserService.resendActivation(email)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao reenviar código de ativação")
  }
}
