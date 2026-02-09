import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/users/validate-token - Valida token de ativação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json({ error: "Token e email são obrigatórios" }, { status: 400 })
    }

    // Mock token para desenvolvimento
    if (token === "123456") {
      // Busca usuário pelo email
      const user = await prisma.user.findFirst({
        where: {
          email,
          isActive: false,
        },
        include: {
          school: true,
        },
      })

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado ou já ativado" }, { status: 404 })
      }

      return NextResponse.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school.name,
        },
      })
    }

    // Validação de token real do banco
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Verifica se o token expirou
    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Token expirado. Solicite um novo código." }, { status: 400 })
    }

    // Busca usuário pelo email
    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: false,
      },
      include: {
        school: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado ou já ativado" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school.name,
      },
    })
  } catch (error) {
    console.error("Error validating token:", error)
    return NextResponse.json({ error: "Erro ao validar token" }, { status: 500 })
  }
}
