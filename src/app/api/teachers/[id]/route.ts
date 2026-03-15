import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { teacherUpdateSchema } from "@/lib/validations/teacher"
import { unmask } from "@/lib/utils/masks"

// GET /api/teachers/[id] – Detalhe de um professor
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

    const teacher = await prisma.teacher.findFirst({
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
        classTeachers: {
          include: {
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      )
    }

    const formatted = {
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

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching teacher:", error)
    return NextResponse.json(
      { error: "Erro ao buscar professor" },
      { status: 500 }
    )
  }
}

// PUT /api/teachers/[id] – Atualiza professor
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
    const validationResult = teacherUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const cleanPhone = data.phone ? unmask(data.phone) : null
    const cleanCpf = data.cpf ? unmask(data.cpf) : null

    // Busca professor existente
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId: currentUser.schoolId },
      include: {
        user: true,
        classTeachers: true,
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      )
    }

    // Verifica duplicação de email
    if (teacher.user && data.email !== teacher.user.email) {
      const dup = await prisma.user.findFirst({
        where: {
          email: data.email,
          schoolId: currentUser.schoolId,
          id: { not: teacher.userId! },
        },
      })
      if (dup) {
        return NextResponse.json(
          { error: "Email já cadastrado nesta escola" },
          { status: 409 }
        )
      }
    }

    // Verifica duplicação de matrícula
    if (data.registrationId && data.registrationId !== teacher.registrationId) {
      const dup = await prisma.teacher.findFirst({
        where: {
          registrationId: data.registrationId,
          schoolId: currentUser.schoolId,
          id: { not: id },
        },
      })
      if (dup) {
        return NextResponse.json(
          { error: "Matrícula já cadastrada nesta escola" },
          { status: 409 }
        )
      }
    }

    // Verifica duplicação de CPF
    if (cleanCpf && cleanCpf !== teacher.cpf) {
      const dup = await prisma.teacher.findFirst({
        where: {
          cpf: cleanCpf,
          schoolId: currentUser.schoolId,
          id: { not: id },
        },
      })
      if (dup) {
        return NextResponse.json(
          { error: "CPF já cadastrado nesta escola" },
          { status: 409 }
        )
      }
    }

    // Valida turmas/disciplinas dos assignments (se fornecidos)
    if (data.assignments && data.assignments.length > 0) {
      const classIds = [...new Set(data.assignments.map((a) => a.classId))]
      const existingClasses = await prisma.class.findMany({
        where: {
          id: { in: classIds },
          schoolId: currentUser.schoolId,
        },
        select: { id: true },
      })

      if (existingClasses.length !== classIds.length) {
        return NextResponse.json(
          { error: "Uma ou mais turmas não foram encontradas" },
          { status: 404 }
        )
      }

      const subjectIds = [
        ...new Set(
          data.assignments
            .filter((a) => a.subjectId)
            .map((a) => a.subjectId!)
        ),
      ]

      if (subjectIds.length > 0) {
        const existingSubjects = await prisma.subject.findMany({
          where: {
            id: { in: subjectIds },
            schoolId: currentUser.schoolId,
          },
          select: { id: true },
        })

        if (existingSubjects.length !== subjectIds.length) {
          return NextResponse.json(
            { error: "Uma ou mais disciplinas não foram encontradas" },
            { status: 404 }
          )
        }
      }
    }

    // Combina observations + internalNotes
    const internalNotes = [data.observations, data.internalNotes]
      .filter(Boolean)
      .join("\n---\n") || null

    // Atualiza em transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualiza User do professor (se vinculado)
      if (teacher.userId) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: {
            name: data.name,
            email: data.email,
            phone: cleanPhone,
          },
        })
      }

      // Atualiza Teacher
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

      // Atualiza vínculos (full replacement se fornecido)
      if (data.assignments !== undefined) {
        // Remove vínculos atuais
        await tx.classTeacher.deleteMany({
          where: {
            teacherId: id,
            schoolId: currentUser.schoolId,
          },
        })

        // Recria vínculos
        if (data.assignments && data.assignments.length > 0) {
          await tx.classTeacher.createMany({
            data: data.assignments.map((a) => ({
              schoolId: currentUser.schoolId,
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

    return NextResponse.json({
      message: "Professor atualizado com sucesso",
      teacherId: result.id,
    })
  } catch (error) {
    console.error("Error updating teacher:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar professor" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao atualizar professor" },
      { status: 500 }
    )
  }
}
