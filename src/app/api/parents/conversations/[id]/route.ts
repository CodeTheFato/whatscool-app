import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/parents/conversations/[id] - Busca uma conversa específica com todas as mensagens
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

    // Busca a conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        class: true,
        student: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    // Verifica se o usuário é participante
    const isParticipant = conversation.participants.some(
      (p: any) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta conversa" },
        { status: 403 }
      )
    }

    // Atualiza lastReadAt do participante
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversationId,
        userId: session.user.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    })

    // Formata resposta
    const response = {
      id: conversation.id,
      type: conversation.type,
      subject: conversation.subject || "Sem assunto",
      audienceType: conversation.audienceType,
      createdAt: conversation.createdAt,
      class: conversation.class
        ? {
          id: conversation.class.id,
          name: conversation.class.name,
          grade: conversation.class.grade,
        }
        : null,
      student: conversation.student
        ? {
          id: conversation.student.id,
          name: conversation.student.user.name,
        }
        : null,
      messages: conversation.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.body,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
        },
        isFromSchool: msg.sender.id !== session.user.id,
      })),
      participants: conversation.participants.map((p: any) => ({
        id: p.userId,
        name: p.user.name,
      })),
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Erro ao buscar conversa:", error)
    return NextResponse.json(
      { error: "Erro ao buscar conversa", details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/parents/conversations/[id] - Envia uma mensagem na conversa
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const requestBody = await request.json()
    const { content } = requestBody

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Conteúdo da mensagem é obrigatório" }, { status: 400 })
    }

    // Verifica se o usuário é participante da conversa
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

    // Cria a mensagem
    const message = await prisma.conversationMessage.create({
      data: {
        body: content.trim(),
        conversationId: conversationId,
        senderId: session.user.id,
      },
    })

    // Atualiza timestamp da conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
    })

    // Atualiza lastReadAt do remetente
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversationId,
        userId: session.user.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Mensagem enviada com sucesso",
      data: {
        id: message.id,
        content: message.body,
        createdAt: message.createdAt,
        sender: {
          id: session.user.id,
          name: session.user.name || '',
        },
      },
    })
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json(
      { error: "Erro ao enviar mensagem", details: error.message },
      { status: 500 }
    )
  }
}
