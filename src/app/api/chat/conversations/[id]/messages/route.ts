import { NextRequest } from "next/server"
import { requireAuth, handleApiError, created } from "@/lib/api"
import { ConversationService } from "@/lib/services/conversation.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { body: messageBody } = await request.json()
    const result = await ConversationService.sendMessage(user, id, messageBody)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao enviar mensagem")
  }
}
