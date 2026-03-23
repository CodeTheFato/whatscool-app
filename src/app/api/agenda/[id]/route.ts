import { requireRole, handleApiError, success } from "@/lib/api"
import { AgendaService } from "@/lib/services/agenda.service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER", "PARENT"])
    const { id } = await params
    const data = await AgendaService.getById(user.schoolId, id)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar atividade")
  }
}
