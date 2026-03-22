import { NextRequest } from "next/server"
import { handleApiError, success, created } from "@/lib/api"
import { SchoolService } from "@/lib/services/school.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await SchoolService.create(body)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Internal server error")
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const result = await SchoolService.list({ page, limit, search })
    return success(result)
  } catch (error) {
    return handleApiError(error, "Internal server error")
  }
}
