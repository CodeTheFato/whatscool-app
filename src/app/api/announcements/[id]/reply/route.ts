import { NextRequest } from "next/server"
import { requireAuth, handleApiError, created } from "@/lib/api"
import { AnnouncementService } from "@/lib/services/announcement.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { message } = await request.json()
    const result = await AnnouncementService.reply(user, id, message)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao responder comunicado")
  }
}
