import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/parents/conversations/[id]/poll - Busca novas mensagens (polling)
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
    const { searchParams } = new URL(request.url)
    const lastMessageId = searchParams.get("lastMessageId")

    // Verifica se a conversa existe e se o usuário é participante
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
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
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Formata mensagens
    const formattedMessages = newMessages.map((msg) => ({
      id: msg.id,
      content: msg.body,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        name: msg.sender.name,
      },
      isFromSchool: msg.sender.id !== session.user.id,
    }))

    // Busca o participante atual para verificar status de leitura
    const participant = conversation.participants.find(
      (p: any) => p.userId === session.user.id
    )

    return NextResponse.json({
      messages: formattedMessages,
      hasNewMessages: formattedMessages.length > 0,
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
