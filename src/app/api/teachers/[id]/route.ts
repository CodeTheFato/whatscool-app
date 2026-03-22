import { NextRequest } from "next/server"
import { requireAuth, requireRole, handleApiError, success, validateBody } from "@/lib/api"
import { teacherUpdateSchema } from "@/lib/validations/teacher"
import { TeacherService } from "@/lib/services/teacher.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const teacher = await TeacherService.getById(user.schoolId, id)
    return success(teacher)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar professor")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const { id } = await params
    const data = validateBody(teacherUpdateSchema, await request.json())
    const result = await TeacherService.update(user.schoolId, id, data)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao atualizar professor")
  }
}
