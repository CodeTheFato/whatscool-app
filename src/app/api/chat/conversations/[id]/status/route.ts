import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/conversations/[id]/status - Busca status da conversa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id: conversationId } = await params

    // Busca usuário logado para pegar schoolId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verifica se a conversa existe e pertence à escola
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        schoolId: currentUser.schoolId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUser.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta conversa" },
        { status: 403 }
      )
    }

    // Busca outros participantes (exceto o usuário atual)
    const otherParticipants = conversation.participants
      .filter((p) => p.userId !== currentUser.id)
      .map((p) => ({
        id: p.userId,
        name: p.user.name,
        role: p.user.role,
        lastReadAt: p.lastReadAt,
      }))

    // Verifica se há mensagens não lidas pelos outros participantes
    const lastMessage = conversation.messages[0]
    const hasUnreadByOthers = otherParticipants.some(
      (p) => !p.lastReadAt || (lastMessage && new Date(lastMessage.createdAt) > new Date(p.lastReadAt))
    )

    return NextResponse.json({
      conversationId: conversation.id,
      status: conversation.status,
      updatedAt: conversation.updatedAt,
      otherParticipants,
      lastMessage: lastMessage
        ? {
          id: lastMessage.id,
          createdAt: lastMessage.createdAt,
        }
        : null,
      hasUnreadByOthers,
    })
  } catch (error: any) {
    console.error("Erro ao buscar status da conversa:", error)
    return NextResponse.json(
      { error: "Erro ao buscar status da conversa", details: error.message },
      { status: 500 }
    )
  }
}
