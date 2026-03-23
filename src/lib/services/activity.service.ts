import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import { sendWhatsappJobsBatch, type WhatsappJob } from "@/lib/aws/sqs"
import type { ActivityFormValues } from "@/lib/validations/activity"
import type { ActivityType } from "@prisma/client"

export const ActivityService = {
  async create(schoolId: string, teacherId: string, userId: string, data: ActivityFormValues) {
    const {
      type,
      classId,
      subjectId,
      title,
      description,
      dueDate,
      maxScore,
      sendToParents = false,
      notifyWhatsapp = false,
      aiGenerated = false,
    } = data

    // Validar que o professor pertence à turma
    const classTeacher = await prisma.classTeacher.findFirst({
      where: { schoolId, teacherId, classId },
    })
    if (!classTeacher) {
      throw new ApiError(403, "Você não é professor desta turma")
    }

    // Validar disciplina se informada
    if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, schoolId },
      })
      if (!subject) {
        throw new ApiError(404, "Disciplina não encontrada nesta escola")
      }
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true },
    })

    // Resolver recipientes (pais ativos da turma)
    let recipientUserIds: string[] = []
    const recipientPhoneMap = new Map<string, string | null>()

    if (sendToParents) {
      const students = await prisma.student.findMany({
        where: { classId, schoolId, status: "ACTIVE" },
        include: {
          studentParents: {
            include: {
              parent: {
                include: {
                  user: { select: { id: true, isActive: true, phone: true } },
                },
              },
            },
          },
        },
      })

      const parentIds = new Set<string>()
      for (const s of students) {
        for (const sp of s.studentParents) {
          if (sp.parent.user.isActive) {
            parentIds.add(sp.parent.user.id)
            recipientPhoneMap.set(sp.parent.user.id, sp.parent.user.phone ?? null)
          }
        }
      }
      recipientUserIds = Array.from(parentIds)

      if (recipientUserIds.length === 0) {
        throw new ApiError(422, "Nenhum responsável ativo encontrado nesta turma")
      }
    }

    // Persistir em transação
    const now = new Date()
    const result = await prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          schoolId,
          teacherId,
          classId,
          subjectId: subjectId || null,
          title: title.trim(),
          description: description.trim(),
          type: type as ActivityType,
          dueDate: dueDate ? new Date(dueDate) : null,
          maxScore: maxScore ?? null,
          sendToParents,
          notifyWhatsapp: sendToParents && notifyWhatsapp,
          aiGenerated,
          publishedAt: sendToParents ? now : null,
        },
      })

      if (sendToParents && recipientUserIds.length > 0) {
        await tx.activityRecipient.createMany({
          data: recipientUserIds.map((uid) => ({
            activityId: activity.id,
            userId: uid,
            provider: "PLATFORM" as const,
            status: "SENT" as const,
          })),
          skipDuplicates: true,
        })

        if (notifyWhatsapp) {
          await tx.activityRecipient.createMany({
            data: recipientUserIds.map((uid) => ({
              activityId: activity.id,
              userId: uid,
              provider: "WHATSAPP" as const,
              status: "PENDING" as const,
            })),
            skipDuplicates: true,
          })
        }
      }

      return activity
    })

    // SQS enqueue (best-effort)
    let queueResult = { enqueued: false, success: 0, failed: 0 }

    if (sendToParents && notifyWhatsapp && recipientUserIds.length > 0) {
      const queueUrl = process.env.SQS_WHATSAPP_QUEUE_URL
      if (!queueUrl) {
        console.error(`[SQS] SQS_WHATSAPP_QUEUE_URL não configurada. activityId=${result.id}`)
      } else {
        const jobs: WhatsappJob[] = recipientUserIds.map((recipientUserId) => ({
          version: 1,
          type: "WHATSAPP_ACTIVITY",
          announcementId: result.id,
          schoolId,
          schoolName: school?.name ?? null,
          createdById: userId,
          recipientUserId,
          recipientPhone: recipientPhoneMap.get(recipientUserId) ?? null,
          audienceType: "CLASS",
          classId,
          studentId: null,
          category: type,
          title: result.title,
          content: result.description,
          allowReplies: false,
          notifyViaWhatsapp: true as const,
          createdAt: new Date().toISOString(),
        }))

        try {
          const batchResult = await sendWhatsappJobsBatch(queueUrl, jobs)
          queueResult = { enqueued: true, success: batchResult.success, failed: batchResult.failed }
        } catch (err) {
          console.error(`[SQS] Falha ao publicar jobs. activityId=${result.id}`, err)
        }
      }
    }

    return {
      activity: {
        id: result.id,
        title: result.title,
        description: result.description,
        type: result.type,
        dueDate: result.dueDate,
        maxScore: result.maxScore,
        sendToParents: result.sendToParents,
        notifyWhatsapp: result.notifyWhatsapp,
        aiGenerated: result.aiGenerated,
        publishedAt: result.publishedAt,
        createdAt: result.createdAt,
      },
      stats: {
        recipientsCount: recipientUserIds.length,
        ...(sendToParents && notifyWhatsapp
          ? {
              whatsapp: {
                queueEnqueued: queueResult.enqueued,
                enqueuedCount: queueResult.success,
                failedCount: queueResult.failed,
              },
            }
          : {}),
      },
    }
  },

  async createSchoolEvent(schoolId: string, userId: string, data: {
    title: string
    description: string
    dueDate?: string | null
    sendToParents?: boolean
    notifyWhatsapp?: boolean
    classIds?: string[]
  }) {
    const { title, description, dueDate, sendToParents = false, notifyWhatsapp = false, classIds } = data

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true },
    })

    // Resolver turmas: se classIds fornecido, usar essas; senão, todas as turmas ativas da escola
    let targetClassIds: string[]
    if (classIds && classIds.length > 0) {
      targetClassIds = classIds
    } else {
      const allClasses = await prisma.class.findMany({
        where: { schoolId },
        select: { id: true },
      })
      targetClassIds = allClasses.map((c) => c.id)
    }

    if (targetClassIds.length === 0) {
      throw new ApiError(422, "Nenhuma turma encontrada na escola")
    }

    const now = new Date()
    const createdActivities: { id: string; classId: string }[] = []

    for (const classId of targetClassIds) {
      // Resolver pais da turma
      let recipientUserIds: string[] = []
      const recipientPhoneMap = new Map<string, string | null>()

      if (sendToParents) {
        const students = await prisma.student.findMany({
          where: { classId, schoolId, status: "ACTIVE" },
          include: {
            studentParents: {
              include: {
                parent: {
                  include: {
                    user: { select: { id: true, isActive: true, phone: true } },
                  },
                },
              },
            },
          },
        })

        const parentIds = new Set<string>()
        for (const s of students) {
          for (const sp of s.studentParents) {
            if (sp.parent.user.isActive) {
              parentIds.add(sp.parent.user.id)
              recipientPhoneMap.set(sp.parent.user.id, sp.parent.user.phone ?? null)
            }
          }
        }
        recipientUserIds = Array.from(parentIds)
      }

      const result = await prisma.$transaction(async (tx) => {
        const activity = await tx.activity.create({
          data: {
            schoolId,
            teacherId: null,
            classId,
            title: title.trim(),
            description: description.trim(),
            type: "EVENT" as ActivityType,
            dueDate: dueDate ? new Date(dueDate) : null,
            sendToParents,
            notifyWhatsapp: sendToParents && notifyWhatsapp,
            aiGenerated: false,
            publishedAt: sendToParents ? now : null,
          },
        })

        if (sendToParents && recipientUserIds.length > 0) {
          await tx.activityRecipient.createMany({
            data: recipientUserIds.map((uid) => ({
              activityId: activity.id,
              userId: uid,
              provider: "PLATFORM" as const,
              status: "SENT" as const,
            })),
            skipDuplicates: true,
          })

          if (notifyWhatsapp) {
            await tx.activityRecipient.createMany({
              data: recipientUserIds.map((uid) => ({
                activityId: activity.id,
                userId: uid,
                provider: "WHATSAPP" as const,
                status: "PENDING" as const,
              })),
              skipDuplicates: true,
            })
          }
        }

        return activity
      })

      createdActivities.push({ id: result.id, classId })

      // SQS (best-effort)
      if (sendToParents && notifyWhatsapp && recipientUserIds.length > 0) {
        const queueUrl = process.env.SQS_WHATSAPP_QUEUE_URL
        if (queueUrl) {
          const jobs: WhatsappJob[] = recipientUserIds.map((recipientUserId) => ({
            version: 1,
            type: "WHATSAPP_ACTIVITY",
            announcementId: result.id,
            schoolId,
            schoolName: school?.name ?? null,
            createdById: userId,
            recipientUserId,
            recipientPhone: recipientPhoneMap.get(recipientUserId) ?? null,
            audienceType: "CLASS",
            classId,
            studentId: null,
            category: "EVENT",
            title: title.trim(),
            content: description.trim(),
            allowReplies: false,
            notifyViaWhatsapp: true as const,
            createdAt: new Date().toISOString(),
          }))

          try {
            await sendWhatsappJobsBatch(queueUrl, jobs)
          } catch (err) {
            console.error(`[SQS] Falha ao publicar jobs. classId=${classId}`, err)
          }
        }
      }
    }

    return {
      createdCount: createdActivities.length,
      activities: createdActivities,
    }
  },

  async listForSchool(schoolId: string, filters?: { startDate?: string; endDate?: string }) {
    const dateFilter = filters?.startDate && filters?.endDate
      ? { dueDate: { gte: new Date(filters.startDate), lte: new Date(filters.endDate), not: null } }
      : {}

    const activities = await prisma.activity.findMany({
      where: { schoolId, ...dateFilter },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return Promise.all(
      activities.map(async (a) => {
        const readCount = a.sendToParents
          ? await prisma.activityRecipient.count({
              where: { activityId: a.id, provider: "PLATFORM", readAt: { not: null } },
            })
          : 0

        return {
          id: a.id,
          title: a.title,
          description: a.description,
          type: a.type,
          dueDate: a.dueDate,
          maxScore: a.maxScore,
          sendToParents: a.sendToParents,
          notifyWhatsapp: a.notifyWhatsapp,
          aiGenerated: a.aiGenerated,
          publishedAt: a.publishedAt,
          createdAt: a.createdAt,
          class: a.class,
          subject: a.subject,
          teacherName: a.teacher?.user?.name ?? "Secretaria",
          totalRecipients: a._count.recipients,
          readCount,
        }
      })
    )
  },

  async listForTeacher(schoolId: string, teacherId: string, filters?: { startDate?: string; endDate?: string }) {
    const dateFilter = filters?.startDate && filters?.endDate
      ? { dueDate: { gte: new Date(filters.startDate), lte: new Date(filters.endDate), not: null } }
      : {}

    const activities = await prisma.activity.findMany({
      where: { schoolId, teacherId, ...dateFilter },
      include: {
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return Promise.all(
      activities.map(async (a) => {
        const readCount = a.sendToParents
          ? await prisma.activityRecipient.count({
              where: { activityId: a.id, provider: "PLATFORM", readAt: { not: null } },
            })
          : 0

        return {
          id: a.id,
          title: a.title,
          description: a.description,
          type: a.type,
          dueDate: a.dueDate,
          maxScore: a.maxScore,
          sendToParents: a.sendToParents,
          notifyWhatsapp: a.notifyWhatsapp,
          aiGenerated: a.aiGenerated,
          publishedAt: a.publishedAt,
          createdAt: a.createdAt,
          class: a.class,
          subject: a.subject,
          totalRecipients: a._count.recipients,
          readCount,
        }
      })
    )
  },

  async getById(schoolId: string, id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, schoolId },
      include: {
        teacher: {
          include: { user: { select: { id: true, name: true } } },
        },
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, name: true } },
        recipients: {
          where: { provider: "PLATFORM" },
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!activity) {
      throw new ApiError(404, "Atividade não encontrada")
    }

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      dueDate: activity.dueDate,
      maxScore: activity.maxScore,
      sendToParents: activity.sendToParents,
      notifyWhatsapp: activity.notifyWhatsapp,
      aiGenerated: activity.aiGenerated,
      publishedAt: activity.publishedAt,
      createdAt: activity.createdAt,
      teacher: activity.teacher?.user
        ? { id: activity.teacher.user.id, name: activity.teacher.user.name }
        : null,
      class: activity.class,
      subject: activity.subject,
      recipients: activity.recipients.map((r) => ({
        id: r.id,
        user: r.user,
        status: r.status,
        readAt: r.readAt,
      })),
    }
  },

  async listForParent(schoolId: string, parentUserId: string, filters?: { startDate?: string; endDate?: string }) {
    // Buscar filhos do pai
    const parent = await prisma.parent.findFirst({
      where: { userId: parentUserId, schoolId },
      include: {
        studentParents: {
          include: {
            student: { select: { classId: true } },
          },
        },
      },
    })

    if (!parent) {
      return []
    }

    const classIds = parent.studentParents
      .map((sp) => sp.student.classId)
      .filter((id): id is string => id !== null)

    if (classIds.length === 0) {
      return []
    }

    // Buscar todas as atividades das turmas dos filhos
    // sendToParents controla apenas notificação, não visibilidade
    const dateFilter = filters?.startDate && filters?.endDate
      ? { dueDate: { gte: new Date(filters.startDate), lte: new Date(filters.endDate), not: null } }
      : {}

    const activities = await prisma.activity.findMany({
      where: {
        schoolId,
        classId: { in: classIds },
        ...dateFilter,
      },
      include: {
        teacher: {
          include: { user: { select: { name: true } } },
        },
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, name: true } },
        recipients: {
          where: { userId: parentUserId, provider: "PLATFORM" },
          select: { readAt: true, status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return activities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      dueDate: a.dueDate,
      publishedAt: a.publishedAt,
      createdAt: a.createdAt,
      teacherName: a.teacher?.user?.name ?? "Secretaria",
      class: a.class,
      subject: a.subject,
      readAt: a.recipients[0]?.readAt ?? null,
      unread: !a.recipients[0]?.readAt,
    }))
  },

  async markRead(activityId: string, userId: string) {
    const updated = await prisma.activityRecipient.updateMany({
      where: { activityId, userId, provider: "PLATFORM", readAt: null },
      data: { readAt: new Date(), status: "READ" },
    })

    if (updated.count === 0) {
      const exists = await prisma.activityRecipient.findFirst({
        where: { activityId, userId },
      })
      if (!exists) {
        throw new ApiError(403, "Você não é destinatário desta atividade")
      }
      return { message: "Atividade já marcada como lida" }
    }

    return { message: "Atividade marcada como lida" }
  },
}
