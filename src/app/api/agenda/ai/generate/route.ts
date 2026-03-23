import { NextRequest } from "next/server"
import { requireRole, handleApiError, success, validateBody } from "@/lib/api"
import { AIService } from "@/lib/services/ai.service"
import { aiGenerateSchema } from "@/lib/validations/agenda"

export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "SECRETARY", "TEACHER"])
    const body = await request.json()
    const data = validateBody(aiGenerateSchema, body)
    const result = await AIService.generateHomework(data)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao gerar conteúdo com IA")
  }
}
