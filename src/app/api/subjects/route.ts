import { requireAuth, handleApiError, success } from "@/lib/api"
import { SubjectService } from "@/lib/services/subject.service"

export async function GET() {
  try {
    const user = await requireAuth()
    const subjects = await SubjectService.list(user.schoolId)
    return success(subjects)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar disciplinas")
  }
}
