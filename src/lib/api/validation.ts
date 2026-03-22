import type { ZodSchema } from "zod"
import { ApiError } from "./errors"

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body)

  if (!result.success) {
    throw new ApiError(400, "Dados inválidos", result.error.issues)
  }

  return result.data
}
