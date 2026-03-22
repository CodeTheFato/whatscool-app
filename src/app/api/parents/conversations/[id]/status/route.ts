import { NextRequest } from "next/server"
import { requireAuth, handleApiError, success } from "@/lib/api"
import { ParentConversationService } from "@/lib/services/parent-conversation.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const result = await ParentConversationService.getStatus(user.id, id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar status da conversa")
  }
}
