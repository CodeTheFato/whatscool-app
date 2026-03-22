import { NextRequest } from "next/server"
import { requireRole, handleApiError, created, validateBody } from "@/lib/api"
import { studentFormSchema } from "@/lib/validations/student"
import { StudentService } from "@/lib/services/student.service"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "SECRETARY"])
    const raw = await request.json()

    // Transform flat frontend payload to nested schema format
    const body = {
      name: raw.studentName ?? raw.name,
      email: raw.studentEmail ?? raw.email,
      phone: raw.studentPhone ?? raw.phone,
      registrationId: raw.registrationId,
      dateOfBirth: raw.dateOfBirth,
      cpf: raw.cpf,
      classId: raw.classId,
      healthInfo: raw.healthInfo,
      address: raw.address,
      city: raw.city,
      state: raw.state,
      zipCode: raw.zipCode,
      guardian1: raw.guardian1 ?? {
        name: raw.parent1Name,
        email: raw.parent1Email,
        phone: raw.parent1Phone,
        kinship: raw.parent1Kinship,
        cpf: raw.parent1Cpf,
      },
      guardian2: raw.guardian2 ?? (raw.parent2Name && raw.parent2Email
        ? {
          name: raw.parent2Name,
          email: raw.parent2Email,
          phone: raw.parent2Phone,
          kinship: raw.parent2Kinship,
          cpf: raw.parent2Cpf,
        }
        : undefined),
    }

    const data = validateBody(studentFormSchema, body)
    const result = await StudentService.create(user.schoolId, raw, data)
    return created(result)
  } catch (error) {
    return handleApiError(error, "Erro ao cadastrar aluno")
  }
}
