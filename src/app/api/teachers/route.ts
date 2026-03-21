import { NextRequest } from "next/server"
import { requireRole, handleApiError, created, validateBody } from "@/lib/api"
import { teacherFormSchema } from "@/lib/validations/teacher"
import { TeacherService } from "@/lib/services/teacher.service"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const data = validateBody(teacherFormSchema, await request.json())
    const result = await TeacherService.create(user.schoolId, data)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao cadastrar professor")
  }
}
