import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/recipients - Lista turmas e alunos com contagem de responsáveis
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

    // Busca todas as turmas com alunos e seus responsáveis
    const classes = await prisma.class.findMany({
      where: {
        schoolId: currentUser.schoolId,
      },
      include: {
        students: {
          include: {
            parents: {
              include: {
                user: {
                  select: {
                    id: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { academicYear: "desc" },
        { grade: "asc" },
        { name: "asc" },
      ],
    })

    // Formata turmas com contagem de responsáveis únicos
    const formattedClasses = classes.map((cls) => {
      const uniqueParentIds = new Set<string>()

      cls.students.forEach((student) => {
        student.parents.forEach((parent) => {
          if (parent.user.isActive) {
            uniqueParentIds.add(parent.user.id)
          }
        })
      })

      return {
        id: cls.id,
        name: cls.name,
        parentCount: uniqueParentIds.size,
      }
    })

    // Busca todos os alunos com seus responsáveis
    const students = await prisma.student.findMany({
      where: {
        schoolId: currentUser.schoolId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    })

    // Formata alunos com seus responsáveis
    const formattedStudents = students
      .filter((student) => student.user.isActive) // Apenas alunos ativos
      .map((student) => ({
        id: student.id,
        name: student.user.name,
        classId: student.class?.id || null,
        className: student.class?.name || "Sem turma",
        parents: student.parents
          .filter((parent) => parent.user.isActive) // Apenas responsáveis ativos
          .map((parent) => ({
            id: parent.user.id,
            name: parent.user.name,
          })),
      }))

    return NextResponse.json({
      classes: formattedClasses,
      students: formattedStudents,
    })
  } catch (error) {
    console.error("Error fetching recipients:", error)
    return NextResponse.json(
      { error: "Erro ao buscar destinatários" },
      { status: 500 }
    )
  }
}
