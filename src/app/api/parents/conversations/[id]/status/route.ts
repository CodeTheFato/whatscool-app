import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/parents/conversations/[id]/status - Busca status da conversa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id: conversationId } = await params

    // Verifica se a conversa existe e se o usuário é participante
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
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
      (p: any) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta conversa" },
        { status: 403 }
      )
    }

    // Busca outros participantes (exceto o usuário atual)
    const otherParticipants = conversation.participants
      .filter((p: any) => p.userId !== session.user.id)
      .map((p: any) => ({
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
