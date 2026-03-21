import { NextRequest } from "next/server"
import { requireAuth, requireRole, handleApiError, success, validateBody } from "@/lib/api"
import { studentUpdateSchema } from "@/lib/validations/student"
import { StudentService } from "@/lib/services/student.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const student = await StudentService.getById(user.schoolId, id)
    return success(student)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar aluno")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const { id } = await params
    const data = validateBody(studentUpdateSchema, await request.json())
    const result = await StudentService.update(user.schoolId, id, data)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao atualizar aluno")
  }
}
