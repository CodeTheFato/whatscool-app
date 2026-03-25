import { requireRole, handleApiError, success } from "@/lib/api"
import { ActivityService } from "@/lib/services/activity.service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER", "PARENT"])
    const { id } = await params
    const data = await ActivityService.getById(user.schoolId, id)
    if (user.role === "PARENT") {
      data.recipients = []
    }
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar atividade")
  }
}
