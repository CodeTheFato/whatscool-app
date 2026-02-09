import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

// POST /api/users/activate - Ativa conta do usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, password } = body

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Token, email e senha são obrigatórios" }, { status: 400 })
    }

    // Validação de senha
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter no mínimo 6 caracteres" }, { status: 400 })
    }

    // Busca usuário
    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: false,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado ou já ativado" }, { status: 404 })
    }

    // Valida token (mock 123456 ou token real)
    if (token !== "123456") {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      })

      if (!verificationToken || verificationToken.expires < new Date()) {
        return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
      }

      // Remove token usado
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      })
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Atualiza usuário: ativa e define senha
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Conta ativada com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error activating account:", error)
    return NextResponse.json({ error: "Erro ao ativar conta" }, { status: 500 })
  }
}
