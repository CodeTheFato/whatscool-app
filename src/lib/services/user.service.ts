import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { normalizePhoneToInternational } from "@/lib/utils/masks"
import type { UserRole } from "@prisma/client"

export const UserService = {
  async list(schoolId: string) {
    return prisma.user.findMany({
      where: { schoolId },
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
      orderBy: { createdAt: "desc" },
    })
  },

  async create(schoolId: string, body: { name: string; email: string; role: string; phone?: string }) {
    const { name, email, role, phone } = body

    if (!name || !email || !role) {
      throw new ApiError(400, "Campos obrigatórios faltando")
    }

    const existing = await prisma.user.findFirst({
      where: { email, schoolId },
    })
    if (existing) {
      throw new ApiError(409, "Email já cadastrado nesta escola")
    }

    const activationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 48)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: "",
        role: role as UserRole,
        phone: phone ? normalizePhoneToInternational(phone) : null,
        schoolId,
        isActive: false,
      },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: activationToken,
        expires: tokenExpiry,
      },
    })

    console.log(`
      ===== TOKEN DE ATIVAÇÃO =====
      Email: ${email}
      Token: ${activationToken}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${activationToken}
      Expira em: ${tokenExpiry.toISOString()}
      =============================
    `)

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      message: "Usuário criado com sucesso. Email de ativação enviado.",
    }
  },

  async activate(body: { token: string; email: string; password: string }) {
    const { token, email, password } = body

    if (!token || !email || !password) {
      throw new ApiError(400, "Token, email e senha são obrigatórios")
    }
    if (password.length < 6) {
      throw new ApiError(400, "A senha deve ter no mínimo 6 caracteres")
    }

    const user = await prisma.user.findFirst({
      where: { email, isActive: false },
    })
    if (!user) {
      throw new ApiError(404, "Usuário não encontrado ou já ativado")
    }

    // Validate token (mock 123456 or real)
    if (token !== "123456") {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: email, token } },
      })

      if (!verificationToken || verificationToken.expires < new Date()) {
        throw new ApiError(400, "Token inválido ou expirado")
      }

      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } },
      })
    }

    const hashedPassword = await hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, isActive: true },
    })

    return {
      success: true,
      message: "Conta ativada com sucesso!",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  },

  async validateToken(body: { token: string; email: string }) {
    const { token, email } = body

    if (!token || !email) {
      throw new ApiError(400, "Token e email são obrigatórios")
    }

    // Mock token for dev
    if (token === "123456") {
      const user = await prisma.user.findFirst({
        where: { email, isActive: false },
        include: { school: true },
      })
      if (!user) {
        throw new ApiError(404, "Usuário não encontrado ou já ativado")
      }
      return {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school.name,
        },
      }
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    })
    if (!verificationToken) {
      throw new ApiError(400, "Token inválido ou expirado")
    }
    if (verificationToken.expires < new Date()) {
      throw new ApiError(400, "Token expirado. Solicite um novo código.")
    }

    const user = await prisma.user.findFirst({
      where: { email, isActive: false },
      include: { school: true },
    })
    if (!user) {
      throw new ApiError(404, "Usuário não encontrado ou já ativado")
    }

    return {
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school.name,
      },
    }
  },

  async resendActivation(email: string) {
    if (!email) {
      throw new ApiError(400, "Email é obrigatório")
    }

    const user = await prisma.user.findFirst({
      where: { email, isActive: false },
      include: { school: true },
    })

    if (!user) {
      // Security: don't reveal if email exists
      return { message: "Se o email existir, um novo código será enviado." }
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    const activationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 48)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: activationToken,
        expires: tokenExpiry,
      },
    })

    console.log(`
      ===== TOKEN DE ATIVAÇÃO REENVIADO =====
      Email: ${email}
      Nome: ${user.name}
      Token: ${activationToken}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${activationToken}
      Expira em: ${tokenExpiry.toISOString()}
      ========================================
    `)

    return { message: "Código de ativação reenviado com sucesso." }
  },
}
