import { requireRole, handleApiError, success } from "@/lib/api"
import { ActivityService } from "@/lib/services/activity.service"

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["PARENT"])
    const { id } = await params
    const result = await ActivityService.markRead(id, user.id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao marcar como lido")
  }
}
