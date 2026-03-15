import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { studentUpdateSchema } from "@/lib/validations/student"
import { unmask } from "@/lib/utils/masks"

// GET /api/students/[id] – Detalhe de um aluno
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const { id } = await params

    const student = await prisma.student.findFirst({
      where: {
        id,
        schoolId: currentUser.schoolId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        parents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    const formatted = {
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
      parents: student.parents.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        phone: p.user.phone,
        kinship: p.kinship,
        cpf: p.cpf,
        isActive: p.user.isActive,
      })),
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Erro ao buscar aluno" }, { status: 500 })
  }
}

// PUT /api/students/[id] – Atualiza aluno e responsáveis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (currentUser.role !== "ADMIN" && currentUser.role !== "SECRETARY") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate
    const validationResult = studentUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      )
    }
    const data = validationResult.data

    // Find existing student
    const student = await prisma.student.findFirst({
      where: { id, schoolId: currentUser.schoolId },
      include: {
        user: true,
        parents: { include: { user: true } },
      },
    })
    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    // Check if registrationId already taken by another student
    if (data.registrationId !== student.registrationId) {
      const dup = await prisma.student.findFirst({
        where: {
          registrationId: data.registrationId,
          schoolId: currentUser.schoolId,
          id: { not: id },
        },
      })
      if (dup) {
        return NextResponse.json({ error: "Matrícula já cadastrada nesta escola" }, { status: 409 })
      }
    }

    // Check if email already taken by another user in school
    if (data.email !== student.user.email) {
      const dup = await prisma.user.findFirst({
        where: {
          email: data.email,
          schoolId: currentUser.schoolId,
          id: { not: student.userId },
        },
      })
      if (dup) {
        return NextResponse.json({ error: "Email do aluno já cadastrado nesta escola" }, { status: 409 })
      }
    }

    // Check classId
    if (data.classId) {
      const cls = await prisma.class.findFirst({
        where: { id: data.classId, schoolId: currentUser.schoolId },
      })
      if (!cls) {
        return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
      }
    }

    // Strip masks from phone/cpf values
    const cleanPhone = data.phone ? unmask(data.phone) : null
    const cleanCpf = data.cpf ? unmask(data.cpf) : null
    const cleanG1Phone = unmask(data.guardian1.phone)
    const cleanG1Cpf = data.guardian1.cpf ? unmask(data.guardian1.cpf) : null

    // Run update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update student's user record
      await tx.user.update({
        where: { id: student.userId },
        data: {
          name: data.name,
          email: data.email,
          phone: cleanPhone,
        },
      })

      // Update student record
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

      // ── Update Parent 1 ─────────────────────────
      const existingParent1 = student.parents[0]
      if (existingParent1) {
        // Check email uniqueness for parent1
        if (data.guardian1.email !== existingParent1.user.email) {
          const dup = await tx.user.findFirst({
            where: {
              email: data.guardian1.email,
              schoolId: currentUser.schoolId,
              id: { not: existingParent1.userId },
            },
          })
          if (dup) {
            throw new Error("Email do responsável 1 já cadastrado nesta escola")
          }
        }

        await tx.user.update({
          where: { id: existingParent1.userId },
          data: {
            name: data.guardian1.name,
            email: data.guardian1.email,
            phone: cleanG1Phone,
          },
        })

        await tx.parent.update({
          where: { id: existingParent1.id },
          data: {
            kinship: data.guardian1.kinship,
            cpf: cleanG1Cpf,
          },
        })
      }

      // ── Update / Create / Remove Parent 2 ──────
      const existingParent2 = student.parents[1]

      if (data.guardian2) {
        const cleanG2Phone = unmask(data.guardian2.phone)
        const cleanG2Cpf = data.guardian2.cpf ? unmask(data.guardian2.cpf) : null

        if (existingParent2) {
          // Update existing parent 2
          if (data.guardian2.email !== existingParent2.user.email) {
            const dup = await tx.user.findFirst({
              where: {
                email: data.guardian2.email,
                schoolId: currentUser.schoolId,
                id: { not: existingParent2.userId },
              },
            })
            if (dup) {
              throw new Error("Email do responsável 2 já cadastrado nesta escola")
            }
          }

          await tx.user.update({
            where: { id: existingParent2.userId },
            data: {
              name: data.guardian2.name,
              email: data.guardian2.email,
              phone: cleanG2Phone,
            },
          })

          await tx.parent.update({
            where: { id: existingParent2.id },
            data: {
              kinship: data.guardian2.kinship,
              cpf: cleanG2Cpf,
            },
          })
        } else {
          // Create new parent 2
          const dupEmail = await tx.user.findFirst({
            where: {
              email: data.guardian2.email,
              schoolId: currentUser.schoolId,
            },
          })
          if (dupEmail) {
            throw new Error("Email do responsável 2 já cadastrado nesta escola")
          }

          const newUser = await tx.user.create({
            data: {
              name: data.guardian2.name,
              email: data.guardian2.email,
              password: "",
              role: "PARENT",
              phone: cleanG2Phone,
              schoolId: currentUser.schoolId,
              isActive: false,
            },
          })

          await tx.parent.create({
            data: {
              userId: newUser.id,
              schoolId: currentUser.schoolId,
              cpf: cleanG2Cpf,
              kinship: data.guardian2.kinship,
              students: { connect: { id } },
            },
          })
        }
      } else if (existingParent2) {
        // Remove parent 2: disconnect from student, delete parent + user
        await tx.parent.update({
          where: { id: existingParent2.id },
          data: { students: { disconnect: { id } } },
        })
        // Only delete if this parent has no other students
        const otherStudents = await tx.parent.findUnique({
          where: { id: existingParent2.id },
          include: { students: { select: { id: true } } },
        })
        if (!otherStudents || otherStudents.students.length === 0) {
          await tx.parent.delete({ where: { id: existingParent2.id } })
          await tx.user.delete({ where: { id: existingParent2.userId } })
        }
      }

      return updatedStudent
    })

    return NextResponse.json({ message: "Aluno atualizado com sucesso", studentId: result.id })
  } catch (error) {
    console.error("Error updating student:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar aluno" },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "Erro ao atualizar aluno" }, { status: 500 })
  }
}
