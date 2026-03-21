import { requireAuth, handleApiError, success } from "@/lib/api"
import { ConversationService } from "@/lib/services/conversation.service"

export async function GET() {
  try {
    const user = await requireAuth()
    const result = await ConversationService.getBadges(user)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar badges")
  }
}
