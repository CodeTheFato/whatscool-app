import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/conversations/[id]/poll - Busca novas mensagens (polling)
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
    const { searchParams } = new URL(request.url)
    const lastMessageId = searchParams.get("lastMessageId")

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
        participants: true,
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

    // Busca mensagens novas
    const whereClause: any = {
      conversationId: conversationId,
    }

    if (lastMessageId) {
      // Busca ID da última mensagem para comparar createdAt
      const lastMessage = await prisma.conversationMessage.findUnique({
        where: { id: lastMessageId },
      })

      if (lastMessage) {
        whereClause.createdAt = {
          gt: lastMessage.createdAt,
        }
      }
    }

    const newMessages = await prisma.conversationMessage.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Busca o participante atual para verificar status de leitura
    const participant = conversation.participants.find(
      (p) => p.userId === currentUser.id
    )

    return NextResponse.json({
      messages: newMessages,
      hasNewMessages: newMessages.length > 0,
      lastReadAt: participant?.lastReadAt || null,
    })
  } catch (error: any) {
    console.error("Erro ao buscar novas mensagens:", error)
    return NextResponse.json(
      { error: "Erro ao buscar novas mensagens", details: error.message },
      { status: 500 }
    )
  }
}
