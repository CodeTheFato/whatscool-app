import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import { unmask } from "@/lib/utils/masks"
import { getSchoolTeachers } from "@/lib/queries/teachers"
import type { z } from "zod"
import type { teacherFormSchema, teacherUpdateSchema } from "@/lib/validations/teacher"

type TeacherCreateData = z.infer<typeof teacherFormSchema>
type TeacherUpdateData = z.infer<typeof teacherUpdateSchema>

async function validateAssignments(schoolId: string, assignments: { classId: string; subjectId?: string | null }[]) {
  if (!assignments || assignments.length === 0) return

  const classIds = [...new Set(assignments.map((a) => a.classId))]
  const existingClasses = await prisma.class.findMany({
    where: { id: { in: classIds }, schoolId },
    select: { id: true },
  })
  if (existingClasses.length !== classIds.length) {
    throw new ApiError(404, "Uma ou mais turmas não foram encontradas")
  }

  const subjectIds = [
    ...new Set(assignments.filter((a) => a.subjectId).map((a) => a.subjectId!)),
  ]
  if (subjectIds.length > 0) {
    const existingSubjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds }, schoolId },
      select: { id: true },
    })
    if (existingSubjects.length !== subjectIds.length) {
      throw new ApiError(404, "Uma ou mais disciplinas não foram encontradas")
    }
  }
}

export const TeacherService = {
  async list(schoolId: string) {
    return getSchoolTeachers(schoolId)
  },

  async getById(schoolId: string, id: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, isActive: true },
        },
        classTeachers: {
          include: {
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!teacher) {
      throw new ApiError(404, "Professor não encontrado")
    }

    return {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.user?.name ?? "",
      email: teacher.user?.email ?? "",
      phone: teacher.user?.phone ?? null,
      registrationId: teacher.registrationId,
      cpf: teacher.cpf,
      dateOfBirth: teacher.dateOfBirth
        ? new Date(teacher.dateOfBirth).toISOString().split("T")[0]
        : null,
      specialization: teacher.specialization,
      internalNotes: teacher.internalNotes,
      hireDate: teacher.hireDate,
      status: teacher.status,
      isActive: teacher.user?.isActive ?? true,
      assignments: teacher.classTeachers.map((ct) => ({
        id: ct.id,
        classId: ct.classId,
        className: ct.class.name,
        subjectId: ct.subjectId,
        subjectName: ct.subject?.name ?? null,
        role: ct.role,
      })),
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }
  },

  async create(schoolId: string, data: TeacherCreateData) {
    const cleanPhone = data.phone ? unmask(data.phone) : null
    const cleanCpf = data.cpf ? unmask(data.cpf) : null

    // Check email uniqueness
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email, schoolId },
    })
    if (existingUser) {
      throw new ApiError(409, "Email já cadastrado nesta escola")
    }

    // Check CPF uniqueness
    if (cleanCpf) {
      const existingCpf = await prisma.teacher.findFirst({
        where: { cpf: cleanCpf, schoolId },
      })
      if (existingCpf) {
        throw new ApiError(409, "CPF já cadastrado nesta escola")
      }
    }

    // Auto-generate registrationId
    const registrationId =
      data.registrationId || `PROF-${Date.now().toString(36).toUpperCase()}`

    const existingRegistration = await prisma.teacher.findFirst({
      where: { registrationId, schoolId },
    })
    if (existingRegistration) {
      throw new ApiError(409, "Matrícula já cadastrada nesta escola")
    }

    // Validate assignments
    if (data.assignments && data.assignments.length > 0) {
      await validateAssignments(schoolId, data.assignments)
    }

    const internalNotes =
      [data.observations, data.internalNotes].filter(Boolean).join("\n---\n") || null

    const result = await prisma.$transaction(async (tx) => {
      const teacherUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: "",
          role: "TEACHER",
          phone: cleanPhone,
          schoolId,
          isActive: false,
        },
      })

      const teacher = await tx.teacher.create({
        data: {
          userId: teacherUser.id,
          schoolId,
          registrationId,
          cpf: cleanCpf,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          specialization: data.specialization || null,
          internalNotes,
        },
      })

      if (data.assignments && data.assignments.length > 0) {
        await tx.classTeacher.createMany({
          data: data.assignments.map((a) => ({
            schoolId,
            classId: a.classId,
            teacherId: teacher.id,
            subjectId: a.subjectId || null,
            role: a.role || "SUBJECT",
          })),
        })
      }

      return { teacherUser, teacher }
    })

    console.log(`
      ===== PROFESSOR CADASTRADO =====
      Nome: ${data.name}
      Email: ${data.email}
      Matrícula: ${registrationId}
      Vínculos: ${data.assignments?.length ?? 0}
      ================================
    `)

    return {
      teacher: {
        id: result.teacher.id,
        name: result.teacherUser.name,
        email: result.teacherUser.email,
        registrationId: result.teacher.registrationId,
      },
      message: "Professor cadastrado com sucesso!",
    }
  },

  async update(schoolId: string, id: string, data: TeacherUpdateData) {
    const cleanPhone = data.phone ? unmask(data.phone) : null
    const cleanCpf = data.cpf ? unmask(data.cpf) : null

    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
      include: { user: true, classTeachers: true },
    })
    if (!teacher) {
      throw new ApiError(404, "Professor não encontrado")
    }

    // Check email uniqueness
    if (teacher.user && data.email !== teacher.user.email) {
      const dup = await prisma.user.findFirst({
        where: { email: data.email, schoolId, id: { not: teacher.userId! } },
      })
      if (dup) {
        throw new ApiError(409, "Email já cadastrado nesta escola")
      }
    }

    // Check registration ID
    if (data.registrationId && data.registrationId !== teacher.registrationId) {
      const dup = await prisma.teacher.findFirst({
        where: { registrationId: data.registrationId, schoolId, id: { not: id } },
      })
      if (dup) {
        throw new ApiError(409, "Matrícula já cadastrada nesta escola")
      }
    }

    // Check CPF
    if (cleanCpf && cleanCpf !== teacher.cpf) {
      const dup = await prisma.teacher.findFirst({
        where: { cpf: cleanCpf, schoolId, id: { not: id } },
      })
      if (dup) {
        throw new ApiError(409, "CPF já cadastrado nesta escola")
      }
    }

    // Validate assignments
    if (data.assignments && data.assignments.length > 0) {
      await validateAssignments(schoolId, data.assignments)
    }

    const internalNotes =
      [data.observations, data.internalNotes].filter(Boolean).join("\n---\n") || null

    const result = await prisma.$transaction(async (tx) => {
      if (teacher.userId) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { name: data.name, email: data.email, phone: cleanPhone },
        })
      }

      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          registrationId: data.registrationId || undefined,
          cpf: cleanCpf,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          specialization: data.specialization || null,
          internalNotes,
          status: data.status || undefined,
        },
      })

      if (data.assignments !== undefined) {
        await tx.classTeacher.deleteMany({
          where: { teacherId: id, schoolId },
        })

        if (data.assignments && data.assignments.length > 0) {
          await tx.classTeacher.createMany({
            data: data.assignments.map((a) => ({
              schoolId,
              classId: a.classId,
              teacherId: id,
              subjectId: a.subjectId || null,
              role: a.role || "SUBJECT",
            })),
          })
        }
      }

      return updatedTeacher
    })

    return { message: "Professor atualizado com sucesso", teacherId: result.id }
  },
}
