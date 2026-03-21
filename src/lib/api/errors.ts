import { NextResponse } from "next/server"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(
  error: unknown,
  fallbackMessage: string,
): NextResponse {
  if (error instanceof ApiError) {
    const body: Record<string, unknown> = { error: error.message }
    if (error.details) body.details = error.details
    return NextResponse.json(body, { status: error.statusCode })
  }

  console.error(`${fallbackMessage}:`, error)

  if (error instanceof Error) {
    return NextResponse.json(
      { error: fallbackMessage, details: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 })
}
