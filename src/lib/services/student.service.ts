import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import { randomBytes } from "crypto"
import { unmask } from "@/lib/utils/masks"
import { getSchoolStudents, getTeacherStudents } from "@/lib/queries/students"
import type { z } from "zod"
import type { studentFormSchema, studentUpdateSchema } from "@/lib/validations/student"

type StudentCreateData = z.infer<typeof studentFormSchema>
type StudentUpdateData = z.infer<typeof studentUpdateSchema>

export const StudentService = {
  async list(schoolId: string) {
    return getSchoolStudents(schoolId)
  },

  async listByTeacher(schoolId: string, userId: string) {
    return getTeacherStudents(schoolId, userId)
  },

  async getById(schoolId: string, id: string) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, isActive: true },
        },
        class: { select: { id: true, name: true } },
        studentParents: {
          include: {
            parent: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true, isActive: true },
                },
              },
            },
          },
          orderBy: { isPrimary: "desc" },
        },
      },
    })

    if (!student) {
      throw new ApiError(404, "Aluno não encontrado")
    }

    return {
      id: student.id,
      userId: student.userId,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      registrationId: student.registrationId,
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : null,
      cpf: student.cpf,
      healthInfo: student.healthInfo,
      status: student.status,
      isActive: student.user.isActive,
      classId: student.classId,
      className: student.class?.name ?? null,
      parents: student.studentParents.map((sp) => ({
        id: sp.parent.id,
        userId: sp.parent.userId,
        name: sp.parent.user.name,
        email: sp.parent.user.email,
        phone: sp.parent.user.phone,
        kinship: sp.kinship,
        cpf: sp.parent.cpf,
        isActive: sp.parent.user.isActive,
      })),
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }
  },

  async create(schoolId: string, raw: Record<string, unknown>, data: StudentCreateData) {
    // Check email uniqueness
    const existingStudentUser = await prisma.user.findFirst({
      where: { email: data.email, schoolId },
    })
    if (existingStudentUser) {
      throw new ApiError(409, "Email do aluno já cadastrado nesta escola")
    }

    const existingGuardian1 = await prisma.user.findFirst({
      where: { email: data.guardian1.email, schoolId },
    })
    if (existingGuardian1) {
      throw new ApiError(409, "Email do responsável 1 já cadastrado nesta escola")
    }

    if (data.guardian2) {
      const existingGuardian2 = await prisma.user.findFirst({
        where: { email: data.guardian2.email, schoolId },
      })
      if (existingGuardian2) {
        throw new ApiError(409, "Email do responsável 2 já cadastrado nesta escola")
      }
    }

    // Check registration ID
    const existingStudent = await prisma.student.findFirst({
      where: { registrationId: data.registrationId, schoolId },
    })
    if (existingStudent) {
      throw new ApiError(409, "Matrícula já cadastrada nesta escola")
    }

    // Validate class
    if (data.classId) {
      const classExists = await prisma.class.findFirst({
        where: { id: data.classId, schoolId },
      })
      if (!classExists) {
        throw new ApiError(404, "Turma não encontrada")
      }
    }

    // Generate activation tokens
    const guardian1Token = randomBytes(32).toString("hex")
    const guardian2Token = data.guardian2 ? randomBytes(32).toString("hex") : null
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 48)

    // Create in transaction
    const result = await prisma.$transaction(async (tx) => {
      const studentUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: "",
          role: "STUDENT",
          phone: data.phone || null,
          schoolId,
          isActive: false,
        },
      })

      const newStudent = await tx.student.create({
        data: {
          userId: studentUser.id,
          schoolId,
          registrationId: data.registrationId,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
          cpf: data.cpf || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zipCode: data.zipCode || null,
          healthInfo: data.healthInfo || null,
          classId: data.classId || null,
          status: "ACTIVE",
        },
      })

      // Create Guardian 1
      const guardian1User = await tx.user.create({
        data: {
          name: data.guardian1.name,
          email: data.guardian1.email,
          password: "",
          role: "PARENT",
          phone: data.guardian1.phone,
          schoolId,
          isActive: false,
        },
      })

      const parent1 = await tx.parent.create({
        data: {
          userId: guardian1User.id,
          schoolId,
          cpf: data.guardian1.cpf || null,
        },
      })

      await tx.studentParent.create({
        data: {
          studentId: newStudent.id,
          parentId: parent1.id,
          kinship: data.guardian1.kinship,
          isPrimary: true,
        },
      })

      await tx.verificationToken.create({
        data: {
          identifier: data.guardian1.email,
          token: guardian1Token,
          expires: tokenExpiry,
        },
      })

      // Create Guardian 2 (optional)
      let guardian2User = null
      if (data.guardian2) {
        guardian2User = await tx.user.create({
          data: {
            name: data.guardian2.name,
            email: data.guardian2.email,
            password: "",
            role: "PARENT",
            phone: data.guardian2.phone,
            schoolId,
            isActive: false,
          },
        })

        const parent2 = await tx.parent.create({
          data: {
            userId: guardian2User.id,
            schoolId,
            cpf: data.guardian2.cpf || null,
          },
        })

        await tx.studentParent.create({
          data: {
            studentId: newStudent.id,
            parentId: parent2.id,
            kinship: data.guardian2.kinship,
            isPrimary: false,
          },
        })

        if (guardian2Token) {
          await tx.verificationToken.create({
            data: {
              identifier: data.guardian2.email,
              token: guardian2Token,
              expires: tokenExpiry,
            },
          })
        }
      }

      return { studentUser, student: newStudent, guardian1User, guardian2User }
    })

    // Log activation tokens (TODO: send email)
    console.log(`
      ===== TOKENS DE ATIVAÇÃO - ALUNO CADASTRADO =====
      Aluno: ${data.name}
      Matrícula: ${data.registrationId}
      Email: ${data.email} (não receberá ativação)

      RESPONSÁVEL 1:
      Nome: ${data.guardian1.name}
      Email: ${data.guardian1.email}
      Parentesco: ${data.guardian1.kinship}
      Token: ${guardian1Token}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${guardian1Token}
      ${result.guardian2User ? `
      RESPONSÁVEL 2:
      Nome: ${data.guardian2?.name}
      Email: ${data.guardian2?.email}
      Parentesco: ${data.guardian2?.kinship}
      Token: ${guardian2Token}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${guardian2Token}
      ` : ""}
      Expira em: ${tokenExpiry.toISOString()}
      =================================================
    `)

    return {
      student: {
        id: result.student.id,
        name: result.studentUser.name,
        email: result.studentUser.email,
        registrationId: result.student.registrationId,
      },
      guardians: {
        guardian1: {
          name: result.guardian1User.name,
          email: result.guardian1User.email,
        },
        guardian2: result.guardian2User
          ? { name: result.guardian2User.name, email: result.guardian2User.email }
          : null,
      },
      message: "Aluno e responsáveis cadastrados com sucesso. Emails de ativação enviados aos responsáveis.",
    }
  },

  async update(schoolId: string, id: string, data: StudentUpdateData) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
        studentParents: {
          include: { parent: { include: { user: true } } },
          orderBy: { isPrimary: "desc" },
        },
      },
    })
    if (!student) {
      throw new ApiError(404, "Aluno não encontrado")
    }

    // Check registration ID uniqueness
    if (data.registrationId !== student.registrationId) {
      const dup = await prisma.student.findFirst({
        where: { registrationId: data.registrationId, schoolId, id: { not: id } },
      })
      if (dup) {
        throw new ApiError(409, "Matrícula já cadastrada nesta escola")
      }
    }

    // Check email uniqueness
    if (data.email !== student.user.email) {
      const dup = await prisma.user.findFirst({
        where: { email: data.email, schoolId, id: { not: student.userId } },
      })
      if (dup) {
        throw new ApiError(409, "Email do aluno já cadastrado nesta escola")
      }
    }

    // Validate class
    if (data.classId) {
      const cls = await prisma.class.findFirst({
        where: { id: data.classId, schoolId },
      })
      if (!cls) {
        throw new ApiError(404, "Turma não encontrada")
      }
    }

    const cleanPhone = data.phone ? unmask(data.phone) : null
    const cleanCpf = data.cpf ? unmask(data.cpf) : null
    const cleanG1Phone = unmask(data.guardian1.phone)
    const cleanG1Cpf = data.guardian1.cpf ? unmask(data.guardian1.cpf) : null

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId },
        data: { name: data.name, email: data.email, phone: cleanPhone },
      })

      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          registrationId: data.registrationId,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          cpf: cleanCpf,
          healthInfo: data.healthInfo ?? null,
          classId: data.classId || null,
          status: data.status ?? undefined,
        },
      })

      // Update Parent 1
      const existingSP1 = student.studentParents[0]
      if (existingSP1) {
        if (data.guardian1.email !== existingSP1.parent.user.email) {
          const dup = await tx.user.findFirst({
            where: { email: data.guardian1.email, schoolId, id: { not: existingSP1.parent.userId } },
          })
          if (dup) throw new Error("Email do responsável 1 já cadastrado nesta escola")
        }

        await tx.user.update({
          where: { id: existingSP1.parent.userId },
          data: { name: data.guardian1.name, email: data.guardian1.email, phone: cleanG1Phone },
        })

        await tx.parent.update({
          where: { id: existingSP1.parent.id },
          data: { cpf: cleanG1Cpf },
        })

        await tx.studentParent.update({
          where: { id: existingSP1.id },
          data: { kinship: data.guardian1.kinship },
        })
      }

      // Update / Create / Remove Parent 2
      const existingSP2 = student.studentParents[1]

      if (data.guardian2) {
        const cleanG2Phone = unmask(data.guardian2.phone)
        const cleanG2Cpf = data.guardian2.cpf ? unmask(data.guardian2.cpf) : null

        if (existingSP2) {
          if (data.guardian2.email !== existingSP2.parent.user.email) {
            const dup = await tx.user.findFirst({
              where: { email: data.guardian2.email, schoolId, id: { not: existingSP2.parent.userId } },
            })
            if (dup) throw new Error("Email do responsável 2 já cadastrado nesta escola")
          }

          await tx.user.update({
            where: { id: existingSP2.parent.userId },
            data: { name: data.guardian2.name, email: data.guardian2.email, phone: cleanG2Phone },
          })

          await tx.parent.update({
            where: { id: existingSP2.parent.id },
            data: { cpf: cleanG2Cpf },
          })

          await tx.studentParent.update({
            where: { id: existingSP2.id },
            data: { kinship: data.guardian2.kinship },
          })
        } else {
          const dupEmail = await tx.user.findFirst({
            where: { email: data.guardian2.email, schoolId },
          })
          if (dupEmail) throw new Error("Email do responsável 2 já cadastrado nesta escola")

          const newUser = await tx.user.create({
            data: {
              name: data.guardian2.name,
              email: data.guardian2.email,
              password: "",
              role: "PARENT",
              phone: cleanG2Phone,
              schoolId,
              isActive: false,
            },
          })

          const newParent = await tx.parent.create({
            data: {
              userId: newUser.id,
              schoolId,
              cpf: cleanG2Cpf,
            },
          })

          await tx.studentParent.create({
            data: {
              studentId: id,
              parentId: newParent.id,
              kinship: data.guardian2.kinship,
              isPrimary: false,
            },
          })
        }
      } else if (existingSP2) {
        // Remove Parent 2 junction
        await tx.studentParent.delete({ where: { id: existingSP2.id } })

        // Check if parent has other student links
        const otherLinks = await tx.studentParent.findMany({
          where: { parentId: existingSP2.parent.id },
        })
        if (otherLinks.length === 0) {
          await tx.parent.delete({ where: { id: existingSP2.parent.id } })
          await tx.user.delete({ where: { id: existingSP2.parent.userId } })
        }
      }

      return updatedStudent
    })

    return { message: "Aluno atualizado com sucesso", studentId: result.id }
  },
}
