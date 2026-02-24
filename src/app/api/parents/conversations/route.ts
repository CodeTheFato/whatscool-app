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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        parent: true,
      },
    })

    if (!user || !user.parent) {
      return NextResponse.json(
        { error: "Usuário não é um responsável" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadFilter = searchParams.get("unread") === "true"
    const searchQuery = searchParams.get("search") || ""

    // Busca conversas onde o pai é participante
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: true },
        },
        announcement: {
          include: {
            class: true,
            student: { include: { user: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const processedConversations = conversations
      .map((conv: any) => {
        const userParticipant = conv.participants.find(
          (p: any) => p.userId === user.id
        )
        const lastMessage = conv.messages[0]
        const isUnread =
          lastMessage &&
          (!userParticipant?.lastReadAt ||
            new Date(lastMessage.createdAt) >
            new Date(userParticipant.lastReadAt))

        const schoolParticipant = conv.participants.find(
          (p: any) => p.userId !== user.id
        )

        const ann = conv.announcement
        return {
          id: conv.id,
          subject:
            conv.subject || ann?.title || "Sem assunto",
          announcementId: ann?.id || null,
          unread: !!isUnread,
          timestamp: lastMessage?.createdAt || conv.createdAt,
          origin: "PLATFORM",
          class: ann?.class
            ? { id: ann.class.id, name: ann.class.name, grade: ann.class.grade }
            : null,
          student: ann?.student
            ? { id: ann.student.id, user: { name: ann.student.user.name } }
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
        if (
          searchQuery &&
          !conv.subject.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false
        }
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
