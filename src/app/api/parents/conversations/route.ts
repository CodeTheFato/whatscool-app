import { NextRequest } from "next/server"
import { requireAuth, handleApiError, success } from "@/lib/api"
import { ParentConversationService } from "@/lib/services/parent-conversation.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const filters = {
      unread: searchParams.get("unread") === "true",
      search: searchParams.get("search") || undefined,
    }
    const data = await ParentConversationService.list(user.id, filters)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar conversas")
  }
}
