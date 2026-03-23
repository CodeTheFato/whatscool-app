import { NextRequest } from "next/server"
import { requireRole, handleApiError, success } from "@/lib/api"
import { ActivityService } from "@/lib/services/activity.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["PARENT"])

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const data = await ActivityService.listForParent(user.schoolId, user.id, { startDate, endDate })
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar agenda")
  }
}
