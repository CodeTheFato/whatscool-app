import { NextRequest } from "next/server"
import { requireAuth, requireRole, handleApiError, success, created } from "@/lib/api"
import { AnnouncementService } from "@/lib/services/announcement.service"

export async function GET() {
  try {
    const user = await requireAuth()
    const isStaff = ["ADMIN", "SECRETARY", "TEACHER"].includes(user.role)
    const data = isStaff
      ? await AnnouncementService.listForStaff(user.schoolId)
      : await AnnouncementService.listForParent(user.id)
    return success(data)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar comunicados")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER"])
    const body = await request.json()
    const result = await AnnouncementService.create(user, body)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao criar comunicado")
  }
}
