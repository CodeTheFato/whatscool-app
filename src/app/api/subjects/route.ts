import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/subjects - Lista disciplinas da escola
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

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId: currentUser.schoolId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        workload: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      { error: "Erro ao buscar disciplinas" },
      { status: 500 }
    )
  }
}
