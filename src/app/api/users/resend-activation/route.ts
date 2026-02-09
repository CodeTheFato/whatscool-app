import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

// POST /api/users/resend-activation - Reenvia código de ativação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Busca usuário pelo email
    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: false, // Apenas usuários inativos podem reenviar
      },
      include: {
        school: true,
      },
    })

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return NextResponse.json(
        { message: "Se o email existir, um novo código será enviado." },
        { status: 200 }
      )
    }

    // Remove tokens antigos para este email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    })

    // Gera novo token de ativação
    const activationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 48) // Token válido por 48 horas

    // Cria novo token de verificação
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: activationToken,
        expires: tokenExpiry,
      },
    })

    // TODO: Enviar email com link de ativação
    // const activationLink = `${process.env.NEXTAUTH_URL}/activate?token=${activationToken}`
    // await sendActivationEmail(email, user.name, activationLink)

    console.log(`
      ===== TOKEN DE ATIVAÇÃO REENVIADO =====
      Email: ${email}
      Nome: ${user.name}
      Token: ${activationToken}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${activationToken}
      Expira em: ${tokenExpiry.toISOString()}
      ========================================
    `)

    return NextResponse.json(
      {
        message: "Código de ativação reenviado com sucesso.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resending activation code:", error)
    return NextResponse.json({ error: "Erro ao reenviar código de ativação" }, { status: 500 })
  }
}
