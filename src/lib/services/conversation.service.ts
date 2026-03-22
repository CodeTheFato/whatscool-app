import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import type { AuthUser } from "@/lib/api/auth"
import type { ConversationStatus } from "@prisma/client"

async function findConversationWithAccess(
  conversationId: string,
  schoolId: string,
  userId: string,
  include?: Record<string, unknown>,
) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, schoolId },
    include: { participants: true, ...include },
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

export const ConversationService = {
  async list(user: AuthUser, filters: { type?: string; unread?: boolean; search?: string }) {
    const where: Record<string, unknown> = {
      schoolId: user.schoolId,
      participants: { some: { userId: user.id } },
    }

    if (filters.type && (filters.type === "DIRECT" || filters.type === "BROADCAST")) {
      where.type = filters.type
    }
    if (filters.search) {
      where.subject = { contains: filters.search, mode: "insensitive" }
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true, name: true, email: true, role: true,
                parent: {
                  include: {
                    studentParents: {
                      include: { student: { include: { user: { select: { name: true } } } } },
                    },
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
        announcement: { select: { id: true, title: true, category: true } },
      },
      orderBy: { updatedAt: "desc" },
    })

    const withUnread = conversations.map((conv) => {
      const userParticipant = conv.participants.find((p) => p.userId === user.id)
      const lastMessage = conv.messages[0]
      const isUnread =
        !userParticipant?.lastReadAt ||
        (lastMessage && new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt))

      return { ...conv, unread: isUnread }
    })

    return filters.unread ? withUnread.filter((c) => c.unread) : withUnread
  },

  async getById(user: AuthUser, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, schoolId: user.schoolId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
        },
        announcement: { select: { id: true, title: true, category: true, content: true } },
      },
    })

    if (!conversation) {
      throw new ApiError(404, "Conversa não encontrada")
    }

    const isParticipant = conversation.participants.some((p) => p.userId === user.id)
    if (!isParticipant) {
      throw new ApiError(403, "Você não tem acesso a esta conversa")
    }

    return conversation
  },

  async patchConversation(user: AuthUser, conversationId: string, body: { action: string; status?: string }) {
    const conversation = await findConversationWithAccess(conversationId, user.schoolId, user.id)

    if (body.action === "mark_read") {
      await prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId: user.id } },
        data: { lastReadAt: new Date() },
      })
      return { message: "Conversa marcada como lida" }
    }

    if (body.action === "update_status" && body.status) {
      if (!["ADMIN", "SECRETARY", "TEACHER"].includes(user.role)) {
        throw new ApiError(403, "Apenas staff pode alterar o status da conversa")
      }
      const updated = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: body.status as ConversationStatus },
      })
      return updated
    }

    throw new ApiError(400, "Ação inválida")
  },

  async create(user: AuthUser, body: { parentUserId: string; message: string; subject?: string }) {
    if (user.role === "PARENT") {
      throw new ApiError(403, "Responsáveis não podem criar conversas diretamente")
    }
    if (!body.parentUserId || !body.message) {
      throw new ApiError(400, "parentUserId e message são obrigatórios")
    }

    const parentUser = await prisma.user.findFirst({
      where: { id: body.parentUserId, role: "PARENT", schoolId: user.schoolId, isActive: true },
    })
    if (!parentUser) {
      throw new ApiError(404, "Responsável não encontrado")
    }

    const conversation = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          schoolId: user.schoolId,
          status: "OPEN",
          subject: body.subject || null,
          parentUserId: parentUser.id,
        },
      })

      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conv.id, userId: user.id },
          { conversationId: conv.id, userId: parentUser.id },
        ],
      })

      await tx.conversationMessage.create({
        data: { conversationId: conv.id, senderId: user.id, body: body.message },
      })

      return conv
    })

    return { id: conversation.id, message: "Conversa criada com sucesso" }
  },

  async sendMessage(user: AuthUser, conversationId: string, messageBody: string) {
    if (!messageBody || !messageBody.trim()) {
      throw new ApiError(400, "Mensagem não pode estar vazia")
    }

    const conversation = await findConversationWithAccess(conversationId, user.schoolId, user.id)

    if (conversation.status === "CLOSED") {
      throw new ApiError(400, "Esta conversa está fechada")
    }

    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.conversationMessage.create({
        data: { conversationId, senderId: user.id, body: messageBody },
        include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
      })

      await tx.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId: user.id } },
        data: { lastReadAt: new Date() },
      })

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })

      return message
    })

    return result
  },

  async poll(user: AuthUser, conversationId: string, lastMessageId: string | null) {
    const conversation = await findConversationWithAccess(conversationId, user.schoolId, user.id)

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
      include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    })

    const participant = conversation.participants.find((p) => p.userId === user.id)

    return {
      messages: newMessages,
      hasNewMessages: newMessages.length > 0,
      lastReadAt: participant?.lastReadAt || null,
    }
  },

  async getStatus(user: AuthUser, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, schoolId: user.schoolId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
        },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })

    if (!conversation) {
      throw new ApiError(404, "Conversa não encontrada")
    }

    const isParticipant = conversation.participants.some((p) => p.userId === user.id)
    if (!isParticipant) {
      throw new ApiError(403, "Você não tem acesso a esta conversa")
    }

    const otherParticipants = conversation.participants
      .filter((p) => p.userId !== user.id)
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

  async getBadges(user: AuthUser) {
    const conversations = await prisma.conversation.findMany({
      where: {
        schoolId: user.schoolId,
        participants: { some: { userId: user.id } },
      },
      include: {
        participants: { where: { userId: user.id }, select: { lastReadAt: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
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

    const announcementUnreadCount = await prisma.announcementRecipient.count({
      where: {
        userId: user.id,
        readAt: null,
        announcement: { schoolId: user.schoolId },
      },
    })

    return { chatUnreadCount, announcementUnreadCount }
  },
}
