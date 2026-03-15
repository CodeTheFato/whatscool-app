import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { teacherFormSchema } from "@/lib/validations/teacher"
import { unmask } from "@/lib/utils/masks"

// GET /api/teachers - Lista professores da escola
export async function GET(request: NextRequest) {
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

    const teachers = await prisma.teacher.findMany({
      where: {
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
      orderBy: { createdAt: "desc" },
    })

    // Format to match TeacherRow interface
    const formattedTeachers = teachers.map((teacher) => {
      const classNames = [
        ...new Set(teacher.classTeachers.map((ct) => ct.class.name)),
      ]
      const subjectNames = [
        ...new Set(
          teacher.classTeachers
            .filter((ct) => ct.subject)
            .map((ct) => ct.subject!.name)
        ),
      ]

      return {
        id: teacher.id,
        name: teacher.user?.name ?? "Professor sem conta",
        email: teacher.user?.email ?? "",
        phone: teacher.user?.phone ?? null,
        registrationId: teacher.registrationId,
        classes: classNames,
        subjects: subjectNames,
        status: teacher.status,
        isActive: teacher.user?.isActive ?? true,
      }
    })

    return NextResponse.json(formattedTeachers)
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json(
      { error: "Erro ao buscar professores" },
      { status: 500 }
    )
  }
}

// POST /api/teachers - Cria novo professor
export async function POST(request: NextRequest) {
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

    // Apenas ADMIN e SECRETARY podem criar professores
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SECRETARY") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()

    // Validate
    const validationResult = teacherFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const cleanPhone = data.phone ? unmask(data.phone) : null
    const cleanCpf = data.cpf ? unmask(data.cpf) : null

    // Verifica se email já existe na escola
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        schoolId: currentUser.schoolId,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado nesta escola" },
        { status: 409 }
      )
    }

    // Verifica CPF duplicado na escola (se fornecido)
    if (cleanCpf) {
      const existingCpf = await prisma.teacher.findFirst({
        where: {
          cpf: cleanCpf,
          schoolId: currentUser.schoolId,
        },
      })

      if (existingCpf) {
        return NextResponse.json(
          { error: "CPF já cadastrado nesta escola" },
          { status: 409 }
        )
      }
    }

    // Auto-generate registrationId if not provided
    const registrationId =
      data.registrationId ||
      `PROF-${Date.now().toString(36).toUpperCase()}`

    // Verifica matrícula duplicada na escola
    const existingRegistration = await prisma.teacher.findFirst({
      where: {
        registrationId,
        schoolId: currentUser.schoolId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Matrícula já cadastrada nesta escola" },
        { status: 409 }
      )
    }

    // Valida se turmas existem na escola
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

      // Valida disciplinas (se fornecidas)
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

    // Combina observations e internalNotes no campo internalNotes
    const internalNotes = [data.observations, data.internalNotes]
      .filter(Boolean)
      .join("\n---\n") || null

    // Cria tudo em transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria User para o professor
      const teacherUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: "", // Será definida na ativação
          role: "TEACHER",
          phone: cleanPhone,
          schoolId: currentUser.schoolId,
          isActive: false, // Inativo até ativar conta
        },
      })

      // Cria registro Teacher
      const teacher = await tx.teacher.create({
        data: {
          userId: teacherUser.id,
          schoolId: currentUser.schoolId,
          registrationId,
          cpf: cleanCpf,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          specialization: data.specialization || null,
          internalNotes,
        },
      })

      // Cria vínculos ClassTeacher
      if (data.assignments && data.assignments.length > 0) {
        await tx.classTeacher.createMany({
          data: data.assignments.map((a) => ({
            schoolId: currentUser.schoolId,
            classId: a.classId,
            teacherId: teacher.id,
            subjectId: a.subjectId || null,
            role: a.role || "SUBJECT",
          })),
        })
      }

      return { teacherUser, teacher }
    })

    // TODO: Enviar email de ativação para o professor
    console.log(`
      ===== PROFESSOR CADASTRADO =====
      Nome: ${data.name}
      Email: ${data.email}
      Matrícula: ${registrationId}
      Vínculos: ${data.assignments?.length ?? 0}
      ================================
    `)

    return NextResponse.json(
      {
        teacher: {
          id: result.teacher.id,
          name: result.teacherUser.name,
          email: result.teacherUser.email,
          registrationId: result.teacher.registrationId,
        },
        message: "Professor cadastrado com sucesso!",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating teacher:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erro ao cadastrar professor", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao cadastrar professor" },
      { status: 500 }
    )
  }
}
