import { NextRequest } from "next/server"
import { requireRole, handleApiError, success } from "@/lib/api"
import { AnnouncementService } from "@/lib/services/announcement.service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY", "TEACHER"])
    const { id } = await params
    const result = await AnnouncementService.getRecipientDetails(id, user.schoolId)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Erro ao buscar destinatários")
  }
}
