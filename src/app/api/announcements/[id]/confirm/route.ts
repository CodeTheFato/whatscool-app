import { NextRequest } from "next/server"
import { requireAuth, handleApiError, success } from "@/lib/api"
import { AnnouncementService } from "@/lib/services/announcement.service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const result = await AnnouncementService.confirm(user.id, id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao confirmar comunicado")
  }
}
