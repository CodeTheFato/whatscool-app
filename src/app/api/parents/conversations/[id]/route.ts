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
    const data = await ParentConversationService.getById(user.id, id)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar conversa")
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { content } = await request.json()
    const result = await ParentConversationService.sendMessage(user.id, user.name, id, content)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao enviar mensagem")
  }
}
