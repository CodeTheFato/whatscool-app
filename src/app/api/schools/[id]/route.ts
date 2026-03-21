import { NextRequest } from "next/server"
import { handleApiError, success } from "@/lib/api"
import { SchoolService } from "@/lib/services/school.service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const school = await SchoolService.getById(id)
    return success(school)
  } catch (error) {
    return handleApiError(error, "Internal server error")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = await SchoolService.update(id, body)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Internal server error")
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const result = await SchoolService.delete(id)
    return success(result)
  } catch (error) {
    return handleApiError(error, "Internal server error")
  }
}
