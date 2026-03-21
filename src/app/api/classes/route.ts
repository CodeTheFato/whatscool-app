import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { classFormSchema } from "@/lib/validations/class"

// GET /api/classes - Lista turmas da escola
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Busca usuário logado para pegar schoolId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Busca todas as turmas da mesma escola
    const classes = await prisma.class.findMany({
      where: {
        schoolId: currentUser.schoolId,
      },
      include: {
        classTeachers: {
          where: { role: "MAIN" },
          take: 1,
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [
        { academicYear: "desc" },
        { grade: "asc" },
        { name: "asc" },
      ],
    })

    // Formata resposta
    const formattedClasses = classes.map((cls) => {
      const mainTeacher = cls.classTeachers[0]?.teacher ?? null
      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        shift: cls.shift,
        academicYear: cls.academicYear,
        maxStudents: cls.maxStudents,
        currentStudents: cls._count.students,
        teacher: mainTeacher
          ? {
            id: mainTeacher.id,
            name: mainTeacher.user?.name ?? "Professor sem conta",
          }
          : null,
        createdAt: cls.createdAt,
      }
    })

    return NextResponse.json(formattedClasses)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Erro ao buscar turmas" }, { status: 500 })
  }
}

// POST /api/classes - Cria nova turma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Busca usuário logado para pegar schoolId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Apenas ADMIN e SECRETARY podem criar turmas
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SECRETARY") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()

    // Valida dados com schema
    const validationResult = classFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verifica se já existe turma com mesmo nome no ano letivo
    const existingClass = await prisma.class.findFirst({
      where: {
        schoolId: currentUser.schoolId,
        name: data.name,
        academicYear: data.academicYear,
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: "Já existe uma turma com este nome no ano letivo informado" },
        { status: 409 }
      )
    }

    // Cria turma
    const newClass = await prisma.class.create({
      data: {
        schoolId: currentUser.schoolId,
        name: data.name,
        grade: data.grade,
        shift: data.shift,
        academicYear: data.academicYear,
        maxStudents: data.maxStudents,
      },
    })

    return NextResponse.json(
      {
        id: newClass.id,
        name: newClass.name,
        grade: newClass.grade,
        shift: newClass.shift,
        academicYear: newClass.academicYear,
        maxStudents: newClass.maxStudents,
        teacher: null,
        message: "Turma cadastrada com sucesso!",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating class:", error)

    // Melhora a mensagem de erro
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erro ao cadastrar turma", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "Erro ao cadastrar turma" }, { status: 500 })
  }
}
