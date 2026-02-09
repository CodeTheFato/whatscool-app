import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { studentFormSchema } from "@/lib/validations/student"

// GET /api/students - Lista alunos da escola
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

    // Busca todos os alunos da mesma escola
    const students = await prisma.student.findMany({
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
                email: true,
                phone: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Formata resposta
    const formattedStudents = students.map((student) => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      registrationId: student.registrationId,
      class: student.class?.name || null,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      parents: student.parents.map((parent) => ({
        id: parent.id,
        name: parent.user.name,
        email: parent.user.email,
        phone: parent.user.phone,
        kinship: parent.kinship,
        isActive: parent.user.isActive,
      })),
      status: student.status,
      isActive: student.user.isActive,
      dateOfBirth: student.dateOfBirth,
      createdAt: student.createdAt,
    }))

    return NextResponse.json(formattedStudents)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Erro ao buscar alunos" }, { status: 500 })
  }
}

// POST /api/students - Cria novo aluno
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

    // Apenas ADMIN e SECRETARY podem criar alunos
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SECRETARY") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()

    // Valida dados com schema
    const validationResult = studentFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verifica se email do aluno já existe na escola
    const existingStudentUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        schoolId: currentUser.schoolId,
      },
    })

    if (existingStudentUser) {
      return NextResponse.json({ error: "Email do aluno já cadastrado nesta escola" }, { status: 409 })
    }

    // Verifica se email do responsável 1 já existe na escola
    const existingGuardian1 = await prisma.user.findFirst({
      where: {
        email: data.guardian1.email,
        schoolId: currentUser.schoolId,
      },
    })

    if (existingGuardian1) {
      return NextResponse.json({ error: "Email do responsável 1 já cadastrado nesta escola" }, { status: 409 })
    }

    // Verifica se email do responsável 2 já existe (se fornecido)
    if (data.guardian2?.email) {
      const existingGuardian2 = await prisma.user.findFirst({
        where: {
          email: data.guardian2.email,
          schoolId: currentUser.schoolId,
        },
      })

      if (existingGuardian2) {
        return NextResponse.json({ error: "Email do responsável 2 já cadastrado nesta escola" }, { status: 409 })
      }
    }

    // Verifica se matrícula já existe na escola
    const existingStudent = await prisma.student.findFirst({
      where: {
        registrationId: data.registrationId,
        schoolId: currentUser.schoolId,
      },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Matrícula já cadastrada nesta escola" }, { status: 409 })
    }

    // Verifica se a turma existe (se fornecida)
    if (data.classId) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: data.classId,
          schoolId: currentUser.schoolId,
        },
      })

      if (!classExists) {
        return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
      }
    }

    // Gera tokens de ativação para os responsáveis
    const guardian1Token = randomBytes(32).toString("hex")
    const guardian2Token = data.guardian2?.email ? randomBytes(32).toString("hex") : null
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 48) // Token válido por 48 horas

    // Cria usuário (aluno) e responsáveis em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria usuário do aluno (sem ativação - não terá acesso à plataforma)
      const studentUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: "", // Senha vazia - aluno não terá acesso
          role: "STUDENT",
          phone: data.phone || null,
          schoolId: currentUser.schoolId,
          isActive: false, // Inativo - não terá acesso
        },
      })

      // Cria aluno
      const newStudent = await tx.student.create({
        data: {
          userId: studentUser.id,
          schoolId: currentUser.schoolId,
          registrationId: data.registrationId,
          dateOfBirth: new Date(data.dateOfBirth),
          cpf: data.cpf || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zipCode: data.zipCode || null,
          guardianName: data.guardian1.name, // Mantém compatibilidade
          guardianPhone: data.guardian1.phone, // Mantém compatibilidade
          healthInfo: data.healthInfo || null,
          classId: data.classId || null,
          status: "ACTIVE",
        },
      })

      // Cria usuário do responsável 1
      const guardian1User = await tx.user.create({
        data: {
          name: data.guardian1.name,
          email: data.guardian1.email,
          password: "", // Senha vazia, será definida na ativação
          role: "PARENT",
          phone: data.guardian1.phone,
          schoolId: currentUser.schoolId,
          isActive: false, // Inativo até ativar
        },
      })

      // Cria registro Parent para responsável 1
      const parent1 = await tx.parent.create({
        data: {
          userId: guardian1User.id,
          schoolId: currentUser.schoolId,
          cpf: data.guardian1.cpf || null,
          kinship: data.guardian1.kinship,
          students: {
            connect: { id: newStudent.id },
          },
        },
      })

      // Cria token de verificação para responsável 1
      await tx.verificationToken.create({
        data: {
          identifier: data.guardian1.email,
          token: guardian1Token,
          expires: tokenExpiry,
        },
      })

      let guardian2User = null
      let parent2 = null

      // Cria usuário do responsável 2 (se fornecido)
      if (data.guardian2?.email && data.guardian2?.name && data.guardian2?.phone && data.guardian2?.kinship) {
        guardian2User = await tx.user.create({
          data: {
            name: data.guardian2.name,
            email: data.guardian2.email,
            password: "", // Senha vazia, será definida na ativação
            role: "PARENT",
            phone: data.guardian2.phone,
            schoolId: currentUser.schoolId,
            isActive: false, // Inativo até ativar
          },
        })

        // Cria registro Parent para responsável 2
        parent2 = await tx.parent.create({
          data: {
            userId: guardian2User.id,
            schoolId: currentUser.schoolId,
            cpf: data.guardian2.cpf || null,
            kinship: data.guardian2.kinship,
            students: {
              connect: { id: newStudent.id },
            },
          },
        })

        // Cria token de verificação para responsável 2
        if (guardian2Token) {
          await tx.verificationToken.create({
            data: {
              identifier: data.guardian2.email,
              token: guardian2Token,
              expires: tokenExpiry,
            },
          })
        }
      }

      return {
        studentUser,
        student: newStudent,
        guardian1User,
        parent1,
        guardian2User,
        parent2
      }
    })

    // TODO: Enviar email com link de ativação para os responsáveis
    console.log(`
      ===== TOKENS DE ATIVAÇÃO - ALUNO CADASTRADO =====
      Aluno: ${data.name}
      Matrícula: ${data.registrationId}
      Email: ${data.email} (não receberá ativação)

      RESPONSÁVEL 1:
      Nome: ${data.guardian1.name}
      Email: ${data.guardian1.email}
      Parentesco: ${data.guardian1.kinship}
      Token: ${guardian1Token}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${guardian1Token}
      ${result.guardian2User ? `
      RESPONSÁVEL 2:
      Nome: ${data.guardian2?.name}
      Email: ${data.guardian2?.email}
      Parentesco: ${data.guardian2?.kinship}
      Token: ${guardian2Token}
      Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/activate?token=${guardian2Token}
      ` : ''}
      Expira em: ${tokenExpiry.toISOString()}
      =================================================
    `)

    return NextResponse.json(
      {
        student: {
          id: result.student.id,
          name: result.studentUser.name,
          email: result.studentUser.email,
          registrationId: result.student.registrationId,
        },
        guardians: {
          guardian1: {
            name: result.guardian1User.name,
            email: result.guardian1User.email,
          },
          guardian2: result.guardian2User ? {
            name: result.guardian2User.name,
            email: result.guardian2User.email,
          } : null,
        },
        message: "Aluno e responsáveis cadastrados com sucesso. Emails de ativação enviados aos responsáveis.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating student:", error)

    // Melhora a mensagem de erro
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erro ao cadastrar aluno", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "Erro ao cadastrar aluno" }, { status: 500 })
  }
}
