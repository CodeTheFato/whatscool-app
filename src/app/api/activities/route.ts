import { NextRequest } from "next/server"
import { requireRole, handleApiError, success, created, validateBody } from "@/lib/api"
import { ActivityService } from "@/lib/services/activity.service"
import { activityFormSchema } from "@/lib/validations/activity"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER"])

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    // Secretária e admin veem todas as atividades da escola
    if (user.role === "SECRETARY" || user.role === "ADMIN") {
      const data = await ActivityService.listForSchool(user.schoolId, { startDate, endDate })
      return success(data)
    }

    // Professor vê apenas suas atividades
    const { prisma } = await import("@/lib/prisma")
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id, schoolId: user.schoolId },
      select: { id: true },
    })

    if (!teacher) {
      return success([])
    }

    const data = await ActivityService.listForTeacher(user.schoolId, teacher.id, { startDate, endDate })
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar agenda")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER"])
    const body = await request.json()

    // Secretária/Admin: cria evento escolar (sem teacher, pode ser escola toda)
    if (user.role === "SECRETARY" || user.role === "ADMIN") {
      const result = await ActivityService.createSchoolEvent(user.schoolId, user.id, {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        sendToParents: body.sendToParents,
        notifyWhatsapp: body.notifyWhatsapp,
        classIds: body.classIds,
      })
      return created(result)
    }

    // Professor: fluxo normal
    const { prisma } = await import("@/lib/prisma")
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id, schoolId: user.schoolId },
      select: { id: true },
    })

    if (!teacher) {
      const { ApiError } = await import("@/lib/api/errors")
      throw new ApiError(403, "Usuário não é professor")
    }

    const data = validateBody(activityFormSchema, body)
    const result = await ActivityService.create(user.schoolId, teacher.id, user.id, data)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao criar atividade")
  }
}
