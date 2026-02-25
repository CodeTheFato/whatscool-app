import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/announcements/[id]/read — Marca comunicado como lido
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id: announcementId } = await params

    // Atualiza readAt no AnnouncementRecipient do usuário
    const updated = await prisma.announcementRecipient.updateMany({
      where: {
        announcementId,
        userId: session.user.id,
        readAt: null, // Só atualiza se ainda não foi lido
      },
      data: {
        readAt: new Date(),
        status: "READ",
      },
    })

    if (updated.count === 0) {
      // Verifica se o recipient existe (qualquer provider)
      const exists = await prisma.announcementRecipient.findFirst({
        where: {
          announcementId,
          userId: session.user.id,
        },
      })

      if (!exists) {
        return NextResponse.json(
          { error: "Você não é destinatário deste comunicado" },
          { status: 403 }
        )
      }

      // Já estava marcado como lido
      return NextResponse.json({ message: "Comunicado já marcado como lido" })
    }

    return NextResponse.json({ message: "Comunicado marcado como lido" })
  } catch (error) {
    console.error("Error marking announcement as read:", error)
    return NextResponse.json(
      { error: "Erro ao marcar comunicado como lido" },
      { status: 500 }
    )
  }
}
