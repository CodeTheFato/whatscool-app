import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/conversations/badges - Retorna contadores de conversas não lidas
export async function GET(request: NextRequest) {
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

    // Busca conversas onde o usuário é participante
    const conversations = await prisma.conversation.findMany({
      where: {
        schoolId: currentUser.schoolId,
        participants: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      include: {
        participants: {
          where: {
            userId: currentUser.id,
          },
          select: {
            lastReadAt: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    })

    let directUnreadCount = 0
    let broadcastUnreadCount = 0

    conversations.forEach((conv) => {
      const userParticipant = conv.participants[0]
      const lastMessage = conv.messages[0]

      // Verifica se está não lida
      const isUnread = !userParticipant?.lastReadAt ||
        (lastMessage && new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt))

      if (isUnread) {
        if (conv.type === "DIRECT") {
          directUnreadCount++
        } else if (conv.type === "BROADCAST") {
          broadcastUnreadCount++
        }
      }
    })

    return NextResponse.json({
      directUnreadCount,
      broadcastUnreadCount,
    })
  } catch (error) {
    console.error("Error fetching conversation badges:", error)
    return NextResponse.json(
      { error: "Erro ao buscar badges de conversas" },
      { status: 500 }
    )
  }
}
