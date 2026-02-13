import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/conversations - Lista conversas da escola
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

    // Busca todas as conversas da escola
    const conversations = await prisma.conversation.findMany({
      where: {
        schoolId: currentUser.schoolId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Última mensagem para preview
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Erro ao buscar conversas" },
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations - Cria nova conversa interna
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

    // Verifica permissões (PARENT não pode criar conversa)
    if (currentUser.role === "PARENT") {
      return NextResponse.json(
        { error: "Responsáveis não podem criar conversas" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { audienceType, classId, studentId, message, subject } = body

    // Validações básicas
    if (!audienceType || !message) {
      return NextResponse.json(
        { error: "Tipo de destinatário e mensagem são obrigatórios" },
        { status: 400 }
      )
    }

    if (!["CLASS", "STUDENT"].includes(audienceType)) {
      return NextResponse.json(
        { error: "Tipo de destinatário inválido" },
        { status: 400 }
      )
    }

    // Resolve destinatários baseado no tipo
    let recipientUserIds: string[] = []

    if (audienceType === "CLASS") {
      if (!classId) {
        return NextResponse.json({ error: "ID da turma é obrigatório" }, { status: 400 })
      }

      // Busca todos os responsáveis dos alunos da turma
      const students = await prisma.student.findMany({
        where: {
          classId,
          schoolId: currentUser.schoolId,
        },
        include: {
          parents: {
            include: {
              user: true,
            },
          },
        },
      })

      console.log(`[CLASS] Found ${students.length} students in class ${classId}`)

      // Coleta IDs únicos dos responsáveis
      const parentIds = new Set<string>()
      students.forEach((student) => {
        student.parents.forEach((parent) => {
          if (parent.user.isActive) {
            parentIds.add(parent.user.id)
          }
        })
      })

      recipientUserIds = Array.from(parentIds)
      console.log(`[CLASS] Resolved ${recipientUserIds.length} unique active parents`)
    } else if (audienceType === "STUDENT") {
      if (!studentId) {
        return NextResponse.json({ error: "ID do aluno é obrigatório" }, { status: 400 })
      }

      console.log(`[STUDENT] Querying student ${studentId} in school ${currentUser.schoolId}`)

      // Busca responsáveis do aluno
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          schoolId: currentUser.schoolId,
        },
        include: {
          parents: {
            include: {
              user: true,
            },
          },
        },
      })

      console.log(`[STUDENT] Query result:`, student ? `Found student with ${student.parents.length} parents` : 'Student not found')

      if (!student) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
      }

      recipientUserIds = student.parents
        .filter((parent) => parent.user.isActive)
        .map((parent) => parent.user.id)

      console.log(`[STUDENT] Resolved ${recipientUserIds.length} active parent user IDs:`, recipientUserIds)
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhum destinatário encontrado" },
        { status: 400 }
      )
    }

    console.log(`[TRANSACTION] Creating conversation with ${recipientUserIds.length} recipient(s)`)

    // Cria conversa + participantes + primeira mensagem em transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria a conversa
      console.log(`[TRANSACTION] Step 1: Creating conversation`)
      const conversation = await tx.conversation.create({
        data: {
          schoolId: currentUser.schoolId,
          status: "OPEN",
        },
      })
      console.log(`[TRANSACTION] Conversation created: ${conversation.id}`)

      // Adiciona participantes (remetente + destinatários)
      const participantData = [
        { conversationId: conversation.id, userId: currentUser.id },
        ...recipientUserIds.map((userId) => ({
          conversationId: conversation.id,
          userId,
        })),
      ]

      console.log(`[TRANSACTION] Step 2: Creating ${participantData.length} participants`)
      await tx.conversationParticipant.createMany({
        data: participantData,
      })
      console.log(`[TRANSACTION] Participants created successfully`)

      // Cria primeira mensagem
      console.log(`[TRANSACTION] Step 3: Creating first message`)
      const firstMessage = await tx.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: currentUser.id,
          body: message,
        },
      })
      console.log(`[TRANSACTION] Message created: ${firstMessage.id}`)

      return { conversation, firstMessage }
    })

    console.log(`
      =================================================
      ✅ NOVA CONVERSA INTERNA CRIADA

      Conversa ID: ${result.conversation.id}
      Criado por: ${currentUser.name} (${currentUser.role})
      Escola: ${currentUser.schoolId}

      Tipo: ${audienceType}
      Destinatários: ${recipientUserIds.length} usuário(s)

      Assunto: ${subject || "Sem assunto"}
      Mensagem: ${message.slice(0, 100)}${message.length > 100 ? "..." : ""}

      Status: OPEN
      Data: ${new Date().toISOString()}
      =================================================
    `)

    return NextResponse.json(
      {
        conversationId: result.conversation.id,
        message: "Conversa criada com sucesso",
        recipientCount: recipientUserIds.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error creating conversation:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Erro ao criar conversa",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
