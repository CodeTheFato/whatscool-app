import { NextRequest } from "next/server"
import { requireRole, handleApiError, success, created, validateBody } from "@/lib/api"
import { AgendaService } from "@/lib/services/agenda.service"
import { agendaFormSchema } from "@/lib/validations/agenda"

export async function GET() {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER"])

    // Buscar teacherId do usuário
    const { prisma } = await import("@/lib/prisma")
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id, schoolId: user.schoolId },
      select: { id: true },
    })

    if (!teacher) {
      return success([])
    }

    const data = await AgendaService.listForTeacher(user.schoolId, teacher.id)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar agenda")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER"])

    const { prisma } = await import("@/lib/prisma")
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id, schoolId: user.schoolId },
      select: { id: true },
    })

    if (!teacher) {
      const { ApiError } = await import("@/lib/api/errors")
      throw new ApiError(403, "Usuário não é professor")
    }

    const body = await request.json()
    const data = validateBody(agendaFormSchema, body)
    const result = await AgendaService.create(user.schoolId, teacher.id, user.id, data)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao criar atividade")
  }
}
