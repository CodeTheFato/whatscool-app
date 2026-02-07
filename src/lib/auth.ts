import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        // Buscar usuário por email (único por escola, então pode ter várias contas com mesmo email)
        const users = await prisma.user.findMany({
          where: {
            email: credentials.email,
            isActive: true,
          },
          include: {
            school: true,
            student: true,
            teacher: true,
            parent: true,
          },
        })

        if (users.length === 0) {
          throw new Error("Email ou senha incorretos")
        }

        // Se houver múltiplas escolas, pegar a primeira (mais tarde podemos implementar seleção)
        const user = users[0]

        // Verificar senha
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          throw new Error("Email ou senha incorretos")
        }

        // Retornar dados do usuário para a session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school.name,
          avatar: user.avatar,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.schoolId = user.schoolId
        token.schoolName = user.schoolName
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.schoolId = token.schoolId as string
        session.user.schoolName = token.schoolName as string
        session.user.avatar = token.avatar as string | null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
