import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendWhatsappJobsBatch, type WhatsappJob } from "@/lib/aws/sqs"

// GET /api/announcements — Lista comunicados
// STAFF: todos da escola
// PARENT: somente os que é destinatário (via AnnouncementRecipient)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isStaff = ["ADMIN", "SECRETARY", "TEACHER"].includes(currentUser.role)

    if (isStaff) {
      // Staff vê todos os comunicados da escola
      const announcements = await prisma.announcement.findMany({
        where: { schoolId: currentUser.schoolId },
        include: {
          creator: { select: { id: true, name: true, role: true } },
          class: { select: { id: true, name: true, grade: true } },
          student: { select: { id: true, user: { select: { name: true } } } },
          _count: { select: { recipients: true, conversations: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(
        announcements.map((a) => ({
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
      )
    }

    // PARENT: comunicados onde é destinatário
    // Filtra apenas PLATFORM para evitar duplicatas (PLATFORM é sempre criado)
    const recipients = await prisma.announcementRecipient.findMany({
      where: { userId: currentUser.id, provider: "PLATFORM" },
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

    return NextResponse.json(
      recipients.map((r) => ({
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
        // Delivery info
        provider: r.provider,
        status: r.status,
        readAt: r.readAt,
        deliveredAt: r.deliveredAt,
        unread: r.readAt === null,
      }))
    )
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Erro ao buscar comunicados" }, { status: 500 })
  }
}

// POST /api/announcements — Cria comunicado + AnnouncementRecipients
// Modelo LAZY: NÃO cria Conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Apenas staff pode criar comunicados
    if (!["ADMIN", "SECRETARY", "TEACHER"].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Apenas funcionários podem criar comunicados" },
        { status: 403 }
      )
    }

    const body = await request.json()
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

    // ===== Validações =====
    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }
    if (!content && !body.message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: "Categoria é obrigatória" }, { status: 400 })
    }
    if (!audienceType || !["CLASS", "STUDENT"].includes(audienceType)) {
      return NextResponse.json(
        { error: "audienceType deve ser CLASS ou STUDENT" },
        { status: 400 }
      )
    }
    if (audienceType === "CLASS" && !classId) {
      return NextResponse.json({ error: "classId é obrigatório para turma" }, { status: 400 })
    }
    if (audienceType === "CLASS" && studentId) {
      return NextResponse.json({ error: "studentId deve ser nulo para turma" }, { status: 400 })
    }
    if (audienceType === "STUDENT" && !studentId) {
      return NextResponse.json({ error: "studentId é obrigatório para aluno específico" }, { status: 400 })
    }

    // Aceita tanto "content" quanto "message" do body por compatibilidade
    const messageBody = (content || body.message || "").trim()

    // ===== Ownership validation + Resolve recipients =====
    let recipientUserIds: string[] = []

    if (audienceType === "CLASS") {
      // Verifica ownership: turma pertence à escola do user
      const classRecord = await prisma.class.findFirst({
        where: { id: classId, schoolId: currentUser.schoolId },
        select: { id: true },
      })
      if (!classRecord) {
        return NextResponse.json({ error: "Turma não encontrada nesta escola" }, { status: 404 })
      }

      const students = await prisma.student.findMany({
        where: { classId, schoolId: currentUser.schoolId, status: "ACTIVE" },
        include: {
          parents: { include: { user: { select: { id: true, isActive: true } } } },
        },
      })

      const parentIds = new Set<string>()
      for (const s of students) {
        for (const p of s.parents) {
          if (p.user.isActive) parentIds.add(p.user.id)
        }
      }
      recipientUserIds = Array.from(parentIds)
    } else {
      // STUDENT: ownership check
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId: currentUser.schoolId },
        include: {
          parents: { include: { user: { select: { id: true, isActive: true } } } },
        },
      })
      if (!student) {
        return NextResponse.json({ error: "Aluno não encontrado nesta escola" }, { status: 404 })
      }

      const parentIds = new Set<string>()
      for (const p of student.parents) {
        if (p.user.isActive) parentIds.add(p.user.id)
      }
      recipientUserIds = Array.from(parentIds)
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhum responsável encontrado para os destinatários selecionados" },
        { status: 422 }
      )
    }

    // ===== Persistência em transaction =====
    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      // 1) Criar Announcement
      const announcement = await tx.announcement.create({
        data: {
          schoolId: currentUser.schoolId,
          createdById: currentUser.id,
          category,
          audienceType,
          classId: audienceType === "CLASS" ? classId : null,
          studentId: audienceType === "STUDENT" ? studentId : null,
          title: String(title).trim(),
          content: messageBody,
          allowReplies: Boolean(allowReplies),
          notifyViaWhatsapp: Boolean(notifyViaWhatsapp),
          publishedAt: now,
        },
      })

      // 2) Recipients PLATFORM — status SENT (entregue na plataforma)
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

      // 3) Recipients WHATSAPP — status PENDING (ainda não enviado)
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

    // ===== SQS: enfileirar jobs de WhatsApp =====
    let queueResult: { enqueued: boolean; success: number; failed: number } = {
      enqueued: false,
      success: 0,
      failed: 0,
    }

    if (notifyViaWhatsapp) {
      const queueUrl = process.env.SQS_WHATSAPP_QUEUE_URL
      if (!queueUrl) {
        console.error(
          `[SQS] SQS_WHATSAPP_QUEUE_URL não configurada. announcementId=${result.id}`
        )
      } else {
        const jobs: WhatsappJob[] = recipientUserIds.map((recipientUserId) => ({
          version: 1,
          type: "WHATSAPP_ANNOUNCEMENT",
          announcementId: result.id,
          schoolId: currentUser.schoolId,
          createdById: currentUser.id,
          recipientUserId,
          audienceType,
          classId: audienceType === "CLASS" ? classId : null,
          studentId: audienceType === "STUDENT" ? studentId : null,
          category,
          title: result.title,
          content: result.content,
          allowReplies: Boolean(allowReplies),
          notifyViaWhatsapp: true as const,
          createdAt: new Date().toISOString(),
        }))

        try {
          const batchResult = await sendWhatsappJobsBatch(queueUrl, jobs)
          queueResult = {
            enqueued: true,
            success: batchResult.success,
            failed: batchResult.failed,
          }
          console.log(
            `[SQS] Enqueued ${batchResult.success}/${batchResult.total} jobs for announcementId=${result.id}`
          )
        } catch (err) {
          console.error(
            `[SQS] Falha ao publicar jobs no SQS. announcementId=${result.id}`,
            err
          )
          queueResult = {
            enqueued: false,
            success: 0,
            failed: recipientUserIds.length,
          }
        }
      }
    }

    // ===== Response =====
    const providers: string[] = ["PLATFORM"]
    if (notifyViaWhatsapp) providers.push("WHATSAPP")

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      { error: "Erro ao criar comunicado" },
      { status: 500 }
    )
  }
}
