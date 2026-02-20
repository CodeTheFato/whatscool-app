import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/parents/conversations - Lista todas as conversas do pai logado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Busca dados do usuário com Parent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        parent: {
          include: {
            students: {
              include: {
                user: true,
                class: true,
              },
            },
          },
        },
      },
    })

    if (!user || !user.parent) {
      return NextResponse.json(
        { error: "Usuário não é um responsável" },
        { status: 403 }
      )
    }

    const parentId = user.parent.id
    const { searchParams } = new URL(request.url)
    const unreadFilter = searchParams.get("unread") === "true"
    const searchQuery = searchParams.get("search") || ""

    // Busca conversas onde o pai é participante
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: true,
          },
        },
        class: true,
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Processa conversas e calcula unread
    const processedConversations = conversations
      .map((conv: any) => {
        const userParticipant = conv.participants.find((p: any) => p.userId === user.id)
        const lastMessage = conv.messages[0]

        // Calcula se está não lida
        const isUnread =
          !userParticipant?.lastReadAt ||
          (lastMessage &&
            new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt))

        // Busca informações de quem enviou (escola)
        const schoolParticipant = conv.participants.find((p: any) => p.userId !== user.id)

        return {
          id: conv.id,
          type: conv.type,
          subject: conv.subject || "Sem assunto",
          audienceType: conv.audienceType,
          unread: isUnread,
          timestamp: lastMessage?.createdAt || conv.createdAt,
          origin: "PLATFORM",
          class: conv.class
            ? {
              id: conv.class.id,
              name: conv.class.name,
              grade: conv.class.grade,
            }
            : null,
          student: conv.student
            ? {
              id: conv.student.id,
              user: {
                name: conv.student.user.name,
              },
            }
            : null,
          schoolSenderName: schoolParticipant?.user?.name || "Escola",
          lastMessage: lastMessage
            ? {
              content: lastMessage.body,
              createdAt: lastMessage.createdAt,
              senderName: lastMessage.sender.name,
            }
            : null,
        }
      })
      .filter((conv: any) => {
        // Filtro de busca
        if (searchQuery && !conv.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }

        // Filtro de não lidas
        if (unreadFilter && !conv.unread) {
          return false
        }

        return true
      })

    return NextResponse.json(processedConversations)
  } catch (error: any) {
    console.error("Erro ao buscar conversas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar conversas", details: error.message },
      { status: 500 }
    )
  }
}
