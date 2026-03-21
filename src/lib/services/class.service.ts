import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import type { ClassFormValues } from "@/lib/validations/class"
import { getSchoolClasses } from "@/lib/queries/classes"

export const ClassService = {
  async list(schoolId: string) {
    return getSchoolClasses(schoolId)
  },

  async create(schoolId: string, data: ClassFormValues) {
    const existing = await prisma.class.findFirst({
      where: {
        schoolId,
        name: data.name,
        academicYear: data.academicYear,
      },
    })

    if (existing) {
      throw new ApiError(409, "Já existe uma turma com este nome no ano letivo informado")
    }

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name: data.name,
        grade: data.grade,
        shift: data.shift,
        academicYear: data.academicYear,
        maxStudents: data.maxStudents,
      },
    })

    return {
      id: newClass.id,
      name: newClass.name,
      grade: newClass.grade,
      shift: newClass.shift,
      academicYear: newClass.academicYear,
      maxStudents: newClass.maxStudents,
      teacher: null,
      message: "Turma cadastrada com sucesso!",
    }
  },
}
