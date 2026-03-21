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
    const data = await ConversationService.getById(user, id)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar conversa")
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const result = await ConversationService.patchConversation(user, id, body)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao atualizar conversa")
  }
}
