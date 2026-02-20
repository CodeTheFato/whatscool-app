import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/parents/conversations/[id]/mark-read - Marca conversa como lida
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

    // Verifica se a conversa existe e se o usuário é participante
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

    // Marca como lida
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    })

    return NextResponse.json({ message: "Conversa marcada como lida" })
  } catch (error: any) {
    console.error("Erro ao marcar conversa como lida:", error)
    return NextResponse.json(
      { error: "Erro ao marcar conversa como lida", details: error.message },
      { status: 500 }
    )
  }
}
