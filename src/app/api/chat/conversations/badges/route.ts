import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/conversations/badges — Retorna contadores de não lidos
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

    // Chat unread: conversas com mensagens mais recentes que lastReadAt do participante
    const conversations = await prisma.conversation.findMany({
      where: {
        schoolId: currentUser.schoolId,
        participants: {
          some: { userId: currentUser.id },
        },
      },
      include: {
        participants: {
          where: { userId: currentUser.id },
          select: { lastReadAt: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    })

    let chatUnreadCount = 0
    for (const conv of conversations) {
      const participant = conv.participants[0]
      const lastMessage = conv.messages[0]
      if (
        lastMessage &&
        (!participant?.lastReadAt ||
          new Date(lastMessage.createdAt) > new Date(participant.lastReadAt))
      ) {
        chatUnreadCount++
      }
    }

    // Announcement unread: comunicados onde o recipient ainda não leu
    const announcementUnreadCount = await prisma.announcementRecipient.count({
      where: {
        userId: currentUser.id,
        readAt: null,
        announcement: { schoolId: currentUser.schoolId },
      },
    })

    return NextResponse.json({
      chatUnreadCount,
      announcementUnreadCount,
    })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json(
      { error: "Erro ao buscar badges" },
      { status: 500 }
    )
  }
}
