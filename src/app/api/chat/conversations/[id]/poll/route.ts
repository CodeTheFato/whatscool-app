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
    const lastMessageId = request.nextUrl.searchParams.get("lastMessageId")
    const result = await ConversationService.poll(user, id, lastMessageId)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar novas mensagens")
  }
}
