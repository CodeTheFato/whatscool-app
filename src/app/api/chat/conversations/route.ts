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

// POST /api/chat/conversations - Cria conversa direta 1:1 (staff → parent)
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

    if (currentUser.role === "PARENT") {
      return NextResponse.json(
        { error: "Responsáveis não podem criar conversas diretamente" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { parentUserId, message, subject } = body

    if (!parentUserId || !message) {
      return NextResponse.json(
        { error: "parentUserId e message são obrigatórios" },
        { status: 400 }
      )
    }

    // Valida que o parent existe e pertence à mesma escola
    const parentUser = await prisma.user.findFirst({
      where: {
        id: parentUserId,
        role: "PARENT",
        schoolId: currentUser.schoolId,
        isActive: true,
      },
    })

    if (!parentUser) {
      return NextResponse.json(
        { error: "Responsável não encontrado" },
        { status: 404 }
      )
    }

    // Cria conversa direta + participantes + primeira mensagem
    const conversation = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          schoolId: currentUser.schoolId,
          status: "OPEN",
          subject: subject || null,
          parentUserId: parentUser.id,
        },
      })

      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conv.id, userId: currentUser.id },
          { conversationId: conv.id, userId: parentUser.id },
        ],
      })

      await tx.conversationMessage.create({
        data: {
          conversationId: conv.id,
          senderId: currentUser.id,
          body: message,
        },
      })

      return conv
    })

    return NextResponse.json(
      {
        id: conversation.id,
        message: "Conversa criada com sucesso",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Erro ao criar conversa" },
      { status: 500 }
    )
  }
}
