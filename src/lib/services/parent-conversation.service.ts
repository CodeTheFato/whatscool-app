import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"

async function requireParent(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parent: true },
  })

  if (!user || !user.parent) {
    throw new ApiError(403, "Usuário não é um responsável")
  }

  return user
}

async function findConversationWithAccess(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  })

  if (!conversation) {
    throw new ApiError(404, "Conversa não encontrada")
  }

  const isParticipant = conversation.participants.some((p) => p.userId === userId)
  if (!isParticipant) {
    throw new ApiError(403, "Você não tem acesso a esta conversa")
  }

  return conversation
}

export const ParentConversationService = {
  async list(userId: string, filters: { unread?: boolean; search?: string }) {
    const user = await requireParent(userId)

    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: {
        participants: { include: { user: true } },
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

    return conversations
      .map((conv) => {
        const userParticipant = conv.participants.find((p) => p.userId === user.id)
        const lastMessage = conv.messages[0]
        const isUnread =
          lastMessage &&
          (!userParticipant?.lastReadAt ||
            new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt))

        const schoolParticipant = conv.participants.find((p) => p.userId !== user.id)
        const ann = conv.announcement

        return {
          id: conv.id,
          subject: conv.subject || ann?.title || "Sem assunto",
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
      .filter((conv) => {
        if (filters.search && !conv.subject.toLowerCase().includes(filters.search.toLowerCase())) {
          return false
        }
        if (filters.unread && !conv.unread) {
          return false
        }
        return true
      })
  },

  async getById(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { include: { user: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
        announcement: {
          include: {
            class: true,
            student: { include: { user: true } },
          },
        },
      },
    })

    if (!conversation) {
      throw new ApiError(404, "Conversa não encontrada")
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      throw new ApiError(403, "Você não tem acesso a esta conversa")
    }

    // Mark as read
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    })

    const ann = conversation.announcement as any
    return {
      id: conversation.id,
      subject: conversation.subject || ann?.title || "Sem assunto",
      announcementId: ann?.id || null,
      createdAt: conversation.createdAt,
      class: ann?.class
        ? { id: ann.class.id, name: ann.class.name, grade: ann.class.grade }
        : null,
      student: ann?.student
        ? { id: ann.student.id, name: ann.student.user.name }
        : null,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        content: msg.body,
        createdAt: msg.createdAt,
        sender: { id: msg.sender.id, name: msg.sender.name },
        isFromSchool: msg.sender.id !== userId,
      })),
      participants: conversation.participants.map((p) => ({
        id: p.userId,
        name: p.user.name,
      })),
    }
  },

  async sendMessage(userId: string, userName: string, conversationId: string, content: string) {
    if (!content || content.trim() === "") {
      throw new ApiError(400, "Conteúdo da mensagem é obrigatório")
    }

    await findConversationWithAccess(conversationId, userId)

    const message = await prisma.conversationMessage.create({
      data: { body: content.trim(), conversationId, senderId: userId },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    })

    return {
      message: "Mensagem enviada com sucesso",
      data: {
        id: message.id,
        content: message.body,
        createdAt: message.createdAt,
        sender: { id: userId, name: userName },
      },
    }
  },

  async poll(userId: string, conversationId: string, lastMessageId: string | null) {
    const conversation = await findConversationWithAccess(conversationId, userId)

    const whereClause: Record<string, unknown> = { conversationId }

    if (lastMessageId) {
      const lastMessage = await prisma.conversationMessage.findUnique({
        where: { id: lastMessageId },
      })
      if (lastMessage) {
        whereClause.createdAt = { gt: lastMessage.createdAt }
      }
    }

    const newMessages = await prisma.conversationMessage.findMany({
      where: whereClause,
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    })

    const participant = conversation.participants.find((p) => p.userId === userId)

    return {
      messages: newMessages.map((msg) => ({
        id: msg.id,
        content: msg.body,
        createdAt: msg.createdAt,
        sender: { id: msg.sender.id, name: msg.sender.name },
        isFromSchool: msg.sender.id !== userId,
      })),
      hasNewMessages: newMessages.length > 0,
      lastReadAt: participant?.lastReadAt || null,
    }
  },

  async markRead(userId: string, conversationId: string) {
    await findConversationWithAccess(conversationId, userId)

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    })

    return { message: "Conversa marcada como lida" }
  },

  async getStatus(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })

    if (!conversation) {
      throw new ApiError(404, "Conversa não encontrada")
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      throw new ApiError(403, "Você não tem acesso a esta conversa")
    }

    const otherParticipants = conversation.participants
      .filter((p) => p.userId !== userId)
      .map((p) => ({
        id: p.userId,
        name: p.user.name,
        role: p.user.role,
        lastReadAt: p.lastReadAt,
      }))

    const lastMessage = conversation.messages[0]
    const hasUnreadByOthers = otherParticipants.some(
      (p) => !p.lastReadAt || (lastMessage && new Date(lastMessage.createdAt) > new Date(p.lastReadAt)),
    )

    return {
      conversationId: conversation.id,
      status: conversation.status,
      updatedAt: conversation.updatedAt,
      otherParticipants,
      lastMessage: lastMessage ? { id: lastMessage.id, createdAt: lastMessage.createdAt } : null,
      hasUnreadByOthers,
    }
  },
}
