import { NextRequest } from "next/server"
import { requireAuth, handleApiError, success } from "@/lib/api"
import { ConversationService } from "@/lib/services/conversation.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const result = await ConversationService.getStatus(user, id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar status da conversa")
  }
}
