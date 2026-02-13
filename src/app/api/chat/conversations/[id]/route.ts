import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/chat/conversations/[id] - Busca conversa específica com todas as mensagens
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params

    // Busca usuário logado para pegar schoolId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Busca a conversa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        schoolId: currentUser.schoolId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
            category: true,
            content: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    // Verifica se o usuário é participante da conversa
    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUser.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta conversa" },
        { status: 403 }
      )
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Erro ao buscar conversa" }, { status: 500 })
  }
}

// PATCH /api/chat/conversations/[id] - Atualiza status da conversa ou marca como lida
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, status } = body

    // Busca usuário logado para pegar schoolId
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Busca a conversa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        schoolId: currentUser.schoolId,
      },
      include: {
        participants: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    // Verifica se o usuário é participante
    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUser.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Você não tem acesso a esta conversa" },
        { status: 403 }
      )
    }

    // Ação: marcar como lida
    if (action === "mark_read") {
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: id,
            userId: currentUser.id,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      })

      return NextResponse.json({ message: "Conversa marcada como lida" })
    }

    // Ação: atualizar status (OPEN/CLOSED)
    if (action === "update_status" && status) {
      // Apenas staff pode fechar conversas
      if (
        currentUser.role !== "ADMIN" &&
        currentUser.role !== "SECRETARY" &&
        currentUser.role !== "TEACHER"
      ) {
        return NextResponse.json(
          { error: "Apenas staff pode alterar o status da conversa" },
          { status: 403 }
        )
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: { status },
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error) {
    console.error("Error updating conversation:", error)
    return NextResponse.json({ error: "Erro ao atualizar conversa" }, { status: 500 })
  }
}
