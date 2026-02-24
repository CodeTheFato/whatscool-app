import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
          publishedAt: a.publishedAt,
          createdAt: a.createdAt,
          totalRecipients: a._count.recipients,
          totalConversations: a._count.conversations,
        }))
      )
    }

    // PARENT: comunicados onde é destinatário
    const recipients = await prisma.announcementRecipient.findMany({
      where: { userId: currentUser.id },
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
        // Delivery info
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
    const { audienceType, classId, studentId, title, content, category } = body

    // Validações
    if (!audienceType || !title || !content || !category) {
      return NextResponse.json(
        { error: "audienceType, title, content e category são obrigatórios" },
        { status: 400 }
      )
    }

    if (!["CLASS", "STUDENT", "ALL_SCHOOL"].includes(audienceType)) {
      return NextResponse.json(
        { error: "Tipo de destinatário inválido" },
        { status: 400 }
      )
    }

    if (audienceType === "CLASS" && !classId) {
      return NextResponse.json({ error: "ID da turma é obrigatório" }, { status: 400 })
    }

    if (audienceType === "STUDENT" && !studentId) {
      return NextResponse.json({ error: "ID do aluno é obrigatório" }, { status: 400 })
    }

    // Resolve destinatários (pais ativos)
    let recipientUserIds: string[] = []

    if (audienceType === "CLASS") {
      const students = await prisma.student.findMany({
        where: { classId, schoolId: currentUser.schoolId },
        include: {
          parents: { include: { user: { select: { id: true, isActive: true } } } },
        },
      })
      const parentIds = new Set<string>()
      students.forEach((s) =>
        s.parents.forEach((p) => {
          if (p.user.isActive) parentIds.add(p.user.id)
        })
      )
      recipientUserIds = Array.from(parentIds)
    } else if (audienceType === "STUDENT") {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId: currentUser.schoolId },
        include: {
          parents: { include: { user: { select: { id: true, isActive: true } } } },
        },
      })
      if (!student) {
        return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
      }
      recipientUserIds = student.parents
        .filter((p) => p.user.isActive)
        .map((p) => p.user.id)
    } else {
      // ALL_SCHOOL: todos os pais ativos da escola
      const parents = await prisma.user.findMany({
        where: { schoolId: currentUser.schoolId, role: "PARENT", isActive: true },
        select: { id: true },
      })
      recipientUserIds = parents.map((p) => p.id)
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhum destinatário encontrado" },
        { status: 400 }
      )
    }

    // Cria Announcement + N AnnouncementRecipients em transação
    const result = await prisma.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          schoolId: currentUser.schoolId,
          createdById: currentUser.id,
          category,
          audienceType,
          classId: audienceType === "CLASS" ? classId : null,
          studentId: audienceType === "STUDENT" ? studentId : null,
          title,
          content,
          publishedAt: new Date(),
        },
      })

      // Cria recipients com status SENT
      await tx.announcementRecipient.createMany({
        data: recipientUserIds.map((userId) => ({
          announcementId: announcement.id,
          userId,
          provider: "PLATFORM" as const,
          status: "SENT" as const,
          sentAt: new Date(),
        })),
      })

      return announcement
    })

    return NextResponse.json(
      {
        announcementId: result.id,
        totalRecipients: recipientUserIds.length,
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
