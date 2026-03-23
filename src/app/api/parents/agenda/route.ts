import { requireRole, handleApiError, success } from "@/lib/api"
import { AgendaService } from "@/lib/services/agenda.service"

export async function GET() {
  try {
    const user = await requireRole(["PARENT"])
    const data = await AgendaService.listForParent(user.schoolId, user.id)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar agenda")
  }
}
