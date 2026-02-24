import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/announcements/[id]/reply — Responde um comunicado (modelo Lazy)
// Cria Conversation + Participants + Message apenas quando há interação
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id: announcementId } = await params
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Mensagem não pode estar vazia" },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Valida que o comunicado existe
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        recipients: { where: { userId: currentUser.id }, take: 1 },
      },
    })

    if (!announcement) {
      return NextResponse.json({ error: "Comunicado não encontrado" }, { status: 404 })
    }

    // Valida que o usuário é destinatário do comunicado
    if (announcement.recipients.length === 0) {
      return NextResponse.json(
        { error: "Você não é destinatário deste comunicado" },
        { status: 403 }
      )
    }

    // Identifica o staff que criou o comunicado (será o outro participante)
    const staffUserId = announcement.createdById

    // Upsert de Conversation usando unique composto [announcementId, parentUserId]
    const result = await prisma.$transaction(async (tx) => {
      // Tenta encontrar conversa existente
      let conversation = await tx.conversation.findUnique({
        where: {
          announcementId_parentUserId: {
            announcementId,
            parentUserId: currentUser.id,
          },
        },
      })

      if (!conversation) {
        // Cria conversa nova
        conversation = await tx.conversation.create({
          data: {
            schoolId: currentUser.schoolId,
            announcementId,
            parentUserId: currentUser.id,
            status: "OPEN",
          },
        })

        // Cria participantes: staff + responsável
        await tx.conversationParticipant.createMany({
          data: [
            { conversationId: conversation.id, userId: staffUserId },
            { conversationId: conversation.id, userId: currentUser.id },
          ],
        })
      }

      // Cria mensagem
      const msg = await tx.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: currentUser.id,
          body: message.trim(),
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true, avatar: true },
          },
        },
      })

      // Atualiza lastReadAt do remetente
      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId: currentUser.id,
          },
        },
        data: { lastReadAt: new Date() },
      })

      // Atualiza updatedAt da conversa
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      })

      return { conversation, message: msg }
    })

    return NextResponse.json(
      {
        conversationId: result.conversation.id,
        message: {
          id: result.message.id,
          content: result.message.body,
          createdAt: result.message.createdAt,
          sender: result.message.sender,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error replying to announcement:", error)
    return NextResponse.json(
      { error: "Erro ao responder comunicado" },
      { status: 500 }
    )
  }
}
