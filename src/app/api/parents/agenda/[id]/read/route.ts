import { requireRole, handleApiError, success } from "@/lib/api"
import { AgendaService } from "@/lib/services/agenda.service"

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["PARENT"])
    const { id } = await params
    const result = await AgendaService.markRead(id, user.id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao marcar como lido")
  }
}
