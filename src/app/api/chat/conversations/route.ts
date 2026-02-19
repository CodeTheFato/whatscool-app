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

    // Query params
    const searchParams = request.nextUrl.searchParams
    const typeFilter = searchParams.get("type") // "DIRECT" | "BROADCAST"
    const unreadFilter = searchParams.get("unread") === "true"
    const searchQuery = searchParams.get("search") || ""

    // Monta filtro base
    const where: any = {
      schoolId: currentUser.schoolId,
      participants: {
        some: {
          userId: currentUser.id,
        },
      },
    }

    // Filtro por tipo
    if (typeFilter && (typeFilter === "DIRECT" || typeFilter === "BROADCAST")) {
      where.type = typeFilter
    }

    // Filtro de busca por subject
    if (searchQuery) {
      where.subject = {
        contains: searchQuery,
        mode: "insensitive",
      }
    }

    // Busca conversas onde o usuário é participante
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                parent: {
                  include: {
                    students: {
                      include: {
                        user: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
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
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Calcula flag unread para cada conversa
    const conversationsWithUnread = conversations.map((conv) => {
      const userParticipant = conv.participants.find(p => p.userId === currentUser.id)
      const lastMessage = conv.messages[0]

      // Conversa não lida se:
      // 1. Não tem lastReadAt (nunca leu)
      // 2. lastReadAt é anterior à última mensagem
      const isUnread = !userParticipant?.lastReadAt ||
        (lastMessage && new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt))

      return {
        ...conv,
        unread: isUnread,
      }
    })

    // Aplica filtro de unread se solicitado
    const filteredConversations = unreadFilter
      ? conversationsWithUnread.filter(c => c.unread)
      : conversationsWithUnread

    return NextResponse.json(filteredConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Erro ao buscar conversas" },
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations - Cria conversas 1:1 com responsáveis
export async function POST(request: NextRequest) {
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

    // PARENT não pode criar conversa
    if (currentUser.role === "PARENT") {
      return NextResponse.json(
        { error: "Responsáveis não podem criar conversas" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { audienceType, classId, studentId, message, subject } = body

    // Validações
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

    if (audienceType === "CLASS" && !classId) {
      return NextResponse.json({ error: "ID da turma é obrigatório" }, { status: 400 })
    }

    if (audienceType === "STUDENT" && !studentId) {
      return NextResponse.json({ error: "ID do aluno é obrigatório" }, { status: 400 })
    }

    // Resolve destinatários (pais ativos)
    let recipientUserIds: string[] = []
    let contextClassId: string | null = null
    let contextStudentId: string | null = null

    if (audienceType === "CLASS") {
      contextClassId = classId
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

      const parentIds = new Set<string>()
      students.forEach((student) => {
        student.parents.forEach((parent) => {
          if (parent.user.isActive) {
            parentIds.add(parent.user.id)
          }
        })
      })

      recipientUserIds = Array.from(parentIds)
    } else {
      contextStudentId = studentId
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

      if (!student) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
      }

      recipientUserIds = student.parents
        .filter((parent) => parent.user.isActive)
        .map((parent) => parent.user.id)
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhum destinatário encontrado" },
        { status: 400 }
      )
    }

    // Cria N conversas 1:1 (uma por responsável)
    const createdConversations = await prisma.$transaction(async (tx) => {
      const conversations = []

      for (const recipientUserId of recipientUserIds) {
        // Define o tipo de conversa baseado no audienceType
        const conversationType = audienceType === "CLASS" ? "BROADCAST" : "DIRECT"

        // Cria conversa
        const conversation = await tx.conversation.create({
          data: {
            schoolId: currentUser.schoolId,
            type: conversationType,
            status: "OPEN",
            subject: subject || null,
            audienceType: audienceType,
            classId: contextClassId,
            studentId: contextStudentId,
          },
        })

        // Cria 2 participantes: sender + recipient
        await tx.conversationParticipant.createMany({
          data: [
            { conversationId: conversation.id, userId: currentUser.id },
            { conversationId: conversation.id, userId: recipientUserId },
          ],
        })

        // Cria primeira mensagem
        await tx.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            senderId: currentUser.id,
            body: message,
          },
        })

        conversations.push(conversation)
      }

      return conversations
    })

    return NextResponse.json(
      {
        message: "Conversas criadas com sucesso",
        recipientCount: recipientUserIds.length,
        createdCount: createdConversations.length,
        firstConversationId: createdConversations[0]?.id || null,
        type: createdConversations[0]?.type || "DIRECT",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error creating conversations:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Erro ao criar conversas",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
