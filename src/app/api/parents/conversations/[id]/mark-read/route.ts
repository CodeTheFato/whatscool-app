import { NextRequest } from "next/server"
import { requireAuth, handleApiError, success } from "@/lib/api"
import { ParentConversationService } from "@/lib/services/parent-conversation.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const result = await ParentConversationService.markRead(user.id, id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao marcar conversa como lida")
  }
}
