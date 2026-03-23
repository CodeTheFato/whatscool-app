import { NextRequest } from "next/server"
import { requireAuth, requireRole, handleApiError, success, created, validateBody } from "@/lib/api"
import { classFormSchema } from "@/lib/validations/class"
import { ClassService } from "@/lib/services/class.service"
import { getTeacherClasses } from "@/lib/queries/classes"

export async function GET() {
  try {
    const user = await requireAuth()

    // Professor vê apenas suas turmas
    if (user.role === "TEACHER") {
      const classes = await getTeacherClasses(user.schoolId, user.id)
      return success(classes)
    }

    const classes = await ClassService.list(user.schoolId)
    return success(classes)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar turmas")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const data = validateBody(classFormSchema, await request.json())
    const result = await ClassService.create(user.schoolId, data)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao cadastrar turma")
  }
}
