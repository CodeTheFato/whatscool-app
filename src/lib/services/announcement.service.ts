import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import { sendWhatsappJobsBatch, type WhatsappJob } from "@/lib/aws/sqs"
import type { AuthUser } from "@/lib/api/auth"
import type { AnnouncementCategory, AnnouncementAudienceType } from "@prisma/client"

interface CreateAnnouncementData {
  audienceType: string
  classId?: string
  studentId?: string
  title: string
  content?: string
  message?: string
  category: string
  notifyViaWhatsapp?: boolean
  allowReplies?: boolean
}

export const AnnouncementService = {
  async listForStaff(schoolId: string) {
    const announcements = await prisma.announcement.findMany({
      where: { schoolId },
      include: {
        creator: { select: { id: true, name: true, role: true } },
        class: { select: { id: true, name: true, grade: true } },
        student: { select: { id: true, user: { select: { name: true } } } },
        _count: { select: { recipients: true, conversations: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category,
      audienceType: a.audienceType,
      class: a.class,
      student: a.student,
      creator: a.creator,
      allowReplies: a.allowReplies,
      notifyViaWhatsapp: a.notifyViaWhatsapp,
      publishedAt: a.publishedAt,
      createdAt: a.createdAt,
      totalRecipients: a._count.recipients,
      totalConversations: a._count.conversations,
    }))
  },

  async listForParent(userId: string) {
    const recipients = await prisma.announcementRecipient.findMany({
      where: { userId, provider: "PLATFORM" },
      include: {
        announcement: {
          include: {
            creator: { select: { id: true, name: true, role: true } },
            class: { select: { id: true, name: true, grade: true } },
            student: { select: { id: true, user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { announcement: { createdAt: "desc" } },
    })

    return recipients.map((r) => ({
      id: r.announcement.id,
      title: r.announcement.title,
      content: r.announcement.content,
      category: r.announcement.category,
      audienceType: r.announcement.audienceType,
      class: r.announcement.class,
      student: r.announcement.student,
      creator: r.announcement.creator,
      publishedAt: r.announcement.publishedAt,
      createdAt: r.announcement.createdAt,
      allowReplies: r.announcement.allowReplies,
      notifyViaWhatsapp: r.announcement.notifyViaWhatsapp,
      provider: r.provider,
      status: r.status,
      readAt: r.readAt,
      deliveredAt: r.deliveredAt,
      unread: r.readAt === null,
    }))
  },

  async create(user: AuthUser, body: CreateAnnouncementData) {
    const {
      audienceType,
      classId,
      studentId,
      title,
      content,
      category,
      notifyViaWhatsapp = false,
      allowReplies = true,
    } = body

    // Validations
    if (!title || !String(title).trim()) {
      throw new ApiError(400, "Título é obrigatório")
    }
    if (!content && !body.message) {
      throw new ApiError(400, "Mensagem é obrigatória")
    }
    if (!category) {
      throw new ApiError(400, "Categoria é obrigatória")
    }
    if (!audienceType || !["CLASS", "STUDENT"].includes(audienceType)) {
      throw new ApiError(400, "audienceType deve ser CLASS ou STUDENT")
    }
    if (audienceType === "CLASS" && !classId) {
      throw new ApiError(400, "classId é obrigatório para turma")
    }
    if (audienceType === "CLASS" && studentId) {
      throw new ApiError(400, "studentId deve ser nulo para turma")
    }
    if (audienceType === "STUDENT" && !studentId) {
      throw new ApiError(400, "studentId é obrigatório para aluno específico")
    }

    const messageBody = (content || body.message || "").trim()

    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      select: { name: true },
    })

    // Resolve recipients
    let recipientUserIds: string[] = []
    const recipientPhoneMap = new Map<string, string | null>()

    if (audienceType === "CLASS") {
      const classRecord = await prisma.class.findFirst({
        where: { id: classId!, schoolId: user.schoolId },
        select: { id: true },
      })
      if (!classRecord) {
        throw new ApiError(404, "Turma não encontrada nesta escola")
      }

      const students = await prisma.student.findMany({
        where: { classId: classId!, schoolId: user.schoolId, status: "ACTIVE" },
        include: {
          parents: { include: { user: { select: { id: true, isActive: true, phone: true } } } },
        },
      })

      const parentIds = new Set<string>()
      for (const s of students) {
        for (const p of s.parents) {
          if (p.user.isActive) {
            parentIds.add(p.user.id)
            recipientPhoneMap.set(p.user.id, p.user.phone ?? null)
          }
        }
      }
      recipientUserIds = Array.from(parentIds)
    } else {
      const student = await prisma.student.findFirst({
        where: { id: studentId!, schoolId: user.schoolId },
        include: {
          parents: { include: { user: { select: { id: true, isActive: true, phone: true } } } },
        },
      })
      if (!student) {
        throw new ApiError(404, "Aluno não encontrado nesta escola")
      }

      const parentIds = new Set<string>()
      for (const p of student.parents) {
        if (p.user.isActive) {
          parentIds.add(p.user.id)
          recipientPhoneMap.set(p.user.id, p.user.phone ?? null)
        }
      }
      recipientUserIds = Array.from(parentIds)
    }

    if (recipientUserIds.length === 0) {
      throw new ApiError(422, "Nenhum responsável encontrado para os destinatários selecionados")
    }

    // Persist in transaction
    const now = new Date()
    const result = await prisma.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          schoolId: user.schoolId,
          createdById: user.id,
          category: category as AnnouncementCategory,
          audienceType: audienceType as AnnouncementAudienceType,
          classId: audienceType === "CLASS" ? classId! : null,
          studentId: audienceType === "STUDENT" ? studentId! : null,
          title: String(title).trim(),
          content: messageBody,
          allowReplies: Boolean(allowReplies),
          notifyViaWhatsapp: Boolean(notifyViaWhatsapp),
          publishedAt: now,
        },
      })

      await tx.announcementRecipient.createMany({
        data: recipientUserIds.map((userId) => ({
          announcementId: announcement.id,
          userId,
          provider: "PLATFORM" as const,
          status: "SENT" as const,
          sentAt: now,
        })),
        skipDuplicates: true,
      })

      if (notifyViaWhatsapp) {
        await tx.announcementRecipient.createMany({
          data: recipientUserIds.map((userId) => ({
            announcementId: announcement.id,
            userId,
            provider: "WHATSAPP" as const,
            status: "PENDING" as const,
            sentAt: null,
          })),
          skipDuplicates: true,
        })
      }

      return announcement
    })

    // SQS enqueue
    let queueResult = { enqueued: false, success: 0, failed: 0 }

    if (notifyViaWhatsapp) {
      const queueUrl = process.env.SQS_WHATSAPP_QUEUE_URL
      if (!queueUrl) {
        console.error(`[SQS] SQS_WHATSAPP_QUEUE_URL não configurada. announcementId=${result.id}`)
      } else {
        const jobs: WhatsappJob[] = recipientUserIds.map((recipientUserId) => ({
          version: 1,
          type: "WHATSAPP_ANNOUNCEMENT",
          announcementId: result.id,
          schoolId: user.schoolId,
          schoolName: school?.name ?? null,
          createdById: user.id,
          recipientUserId,
          recipientPhone: recipientPhoneMap.get(recipientUserId) ?? null,
          audienceType,
          classId: audienceType === "CLASS" ? classId! : null,
          studentId: audienceType === "STUDENT" ? studentId! : null,
          category,
          title: result.title,
          content: result.content,
          allowReplies: Boolean(allowReplies),
          notifyViaWhatsapp: true as const,
          createdAt: new Date().toISOString(),
        }))

        try {
          const batchResult = await sendWhatsappJobsBatch(queueUrl, jobs)
          queueResult = { enqueued: true, success: batchResult.success, failed: batchResult.failed }
          console.log(`[SQS] Enqueued ${batchResult.success}/${batchResult.total} jobs for announcementId=${result.id}`)
        } catch (err) {
          console.error(`[SQS] Falha ao publicar jobs no SQS. announcementId=${result.id}`, err)
          queueResult = { enqueued: false, success: 0, failed: recipientUserIds.length }
        }
      }
    }

    const providers: string[] = ["PLATFORM"]
    if (notifyViaWhatsapp) providers.push("WHATSAPP")

    return {
      announcement: {
        id: result.id,
        title: result.title,
        content: result.content,
        category: result.category,
        audienceType: result.audienceType,
        classId: result.classId,
        studentId: result.studentId,
        allowReplies: result.allowReplies,
        notifyViaWhatsapp: result.notifyViaWhatsapp,
        publishedAt: result.publishedAt,
        createdAt: result.createdAt,
      },
      stats: {
        recipientsCount: recipientUserIds.length,
        providers,
        platform: { count: recipientUserIds.length, status: "SENT" },
        ...(notifyViaWhatsapp
          ? {
            whatsapp: {
              count: recipientUserIds.length,
              status: "PENDING",
              queueEnqueued: queueResult.enqueued,
              enqueuedCount: queueResult.success,
              failedCount: queueResult.failed,
            },
          }
          : {}),
      },
    }
  },

  async markRead(userId: string, announcementId: string) {
    const updated = await prisma.announcementRecipient.updateMany({
      where: { announcementId, userId, readAt: null },
      data: { readAt: new Date(), status: "READ" },
    })

    if (updated.count === 0) {
      const exists = await prisma.announcementRecipient.findFirst({
        where: { announcementId, userId },
      })
      if (!exists) {
        throw new ApiError(403, "Você não é destinatário deste comunicado")
      }
      return { message: "Comunicado já marcado como lido" }
    }

    return { message: "Comunicado marcado como lido" }
  },

  async reply(user: AuthUser, announcementId: string, message: string) {
    if (!message || !message.trim()) {
      throw new ApiError(400, "Mensagem não pode estar vazia")
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { recipients: { where: { userId: user.id }, take: 1 } },
    })

    if (!announcement) {
      throw new ApiError(404, "Comunicado não encontrado")
    }
    if (announcement.recipients.length === 0) {
      throw new ApiError(403, "Você não é destinatário deste comunicado")
    }

    const staffUserId = announcement.createdById

    const result = await prisma.$transaction(async (tx) => {
      let conversation = await tx.conversation.findUnique({
        where: {
          announcementId_parentUserId: {
            announcementId,
            parentUserId: user.id,
          },
        },
      })

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            schoolId: user.schoolId,
            announcementId,
            parentUserId: user.id,
            status: "OPEN",
          },
        })

        await tx.conversationParticipant.createMany({
          data: [
            { conversationId: conversation.id, userId: staffUserId },
            { conversationId: conversation.id, userId: user.id },
          ],
        })
      }

      const msg = await tx.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          body: message.trim(),
        },
        include: {
          sender: { select: { id: true, name: true, role: true, avatar: true } },
        },
      })

      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId: user.id,
          },
        },
        data: { lastReadAt: new Date() },
      })

      await tx.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      })

      return { conversation, message: msg }
    })

    return {
      conversationId: result.conversation.id,
      message: {
        id: result.message.id,
        content: result.message.body,
        createdAt: result.message.createdAt,
        sender: result.message.sender,
      },
    }
  },
}
