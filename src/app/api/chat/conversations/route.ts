import { NextRequest } from "next/server"
import { requireAuth, handleApiError, success, created } from "@/lib/api"
import { ConversationService } from "@/lib/services/conversation.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const filters = {
      type: searchParams.get("type") || undefined,
      unread: searchParams.get("unread") === "true",
      search: searchParams.get("search") || undefined,
    }
    const data = await ConversationService.list(user, filters)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar conversas")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const result = await ConversationService.create(user, body)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao criar conversa")
  }
}
