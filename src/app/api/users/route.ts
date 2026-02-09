import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

// GET /api/users - Lista usuários da escola
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

    // Busca todos os usuários da mesma escola
    const users = await prisma.user.findMany({
      where: {
        schoolId: currentUser.schoolId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        avatar: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

// POST /api/users - Cria novo usuário
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

    // Apenas ADMIN e SECRETARY podem criar usuários
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SECRETARY") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, phone } = body

    // Validações
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    // Verifica se email já existe na escola
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        schoolId: currentUser.schoolId,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado nesta escola" }, { status: 409 })
    }

    // Gera token de ativação
    const activationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 48) // Token válido por 48 horas

    // Cria usuário sem senha (será definida na ativação)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: "", // Senha vazia, será definida na ativação
        role,
        phone: phone || null,
        schoolId: currentUser.schoolId,
        isActive: false, // Inativo até ativar
      },
    })

    // Cria token de verificação
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: activationToken,
        expires: tokenExpiry,
      },
    })

    // TODO: Enviar email com link de ativação
    // const activationLink = `${process.env.NEXTAUTH_URL}/activate?token=${activationToken}`
    // await sendActivationEmail(email, name, activationLink)

    console.log(`
      ===== TOKEN DE ATIVAÇÃO =====
      Email: ${email}
      Token: ${activationToken}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${activationToken}
      Expira em: ${tokenExpiry.toISOString()}
      =============================
    `)

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        message: "Usuário criado com sucesso. Email de ativação enviado.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
