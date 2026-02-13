import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/chat/conversations/[id]/messages - Envia mensagem em uma conversa
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { body: messageBody } = body

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json(
        { error: "Mensagem não pode estar vazia" },
        { status: 400 }
      )
    }

    // Busca usuário logado para pegar schoolId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Busca a conversa e verifica permissões
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        schoolId: currentUser.schoolId,
      },
      include: {
        participants: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    // Verifica se o usuário é participante
    const participant = conversation.participants.find(
      (p) => p.userId === currentUser.id
    )

    if (!participant) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta conversa" },
        { status: 403 }
      )
    }

    // Verifica se a conversa está fechada
    if (conversation.status === "CLOSED") {
      return NextResponse.json(
        { error: "Esta conversa está fechada" },
        { status: 400 }
      )
    }

    // Cria a mensagem e atualiza lastReadAt do remetente em transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria mensagem
      const message = await tx.conversationMessage.create({
        data: {
          conversationId: id,
          senderId: currentUser.id,
          body: messageBody,
        },
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
      })

      // Atualiza lastReadAt do remetente
      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: id,
            userId: currentUser.id,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      })

      // Atualiza updatedAt da conversa
      await tx.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      })

      return message
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
}
