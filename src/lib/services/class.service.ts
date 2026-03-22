import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import type { ClassFormValues } from "@/lib/validations/class"
import { getSchoolClasses } from "@/lib/queries/classes"

export const ClassService = {
  async list(schoolId: string) {
    return getSchoolClasses(schoolId)
  },

  async create(schoolId: string, data: ClassFormValues) {
    // Find or create AcademicYear
    let academicYear = await prisma.academicYear.findUnique({
      where: { schoolId_year: { schoolId, year: data.academicYear } },
    })

    if (!academicYear) {
      academicYear = await prisma.academicYear.create({
        data: { schoolId, year: data.academicYear, isCurrent: true },
      })
    }

    // Check duplicate class name within same academic year
    const existing = await prisma.class.findFirst({
      where: {
        schoolId,
        name: data.name,
        academicYearId: academicYear.id,
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
        academicYearId: academicYear.id,
        maxStudents: data.maxStudents,
      },
    })

    return {
      id: newClass.id,
      name: newClass.name,
      grade: newClass.grade,
      shift: newClass.shift,
      academicYear: data.academicYear,
      maxStudents: newClass.maxStudents,
      teacher: null,
      message: "Turma cadastrada com sucesso!",
    }
  },
}
