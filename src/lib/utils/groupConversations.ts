/**
 * Utilitário para agrupar conversas criadas em lote (envio para turma)
 * Detecta conversas consecutivas com mesmo subject, mesma turma e criadas em curto espaço de tempo
 */

type ConversationData = {
  id: string
  subject: string
  audienceType?: string | null
  class?: { id: string; name: string; grade: string } | null
  timestamp: Date
  [key: string]: any
}

export type GroupedItem =
  | {
    type: "group"
    turma: string
    count: number
    id: string // ID único para key do React
    conversations: ConversationData[]
  }
  | {
    type: "conversation"
    data: ConversationData
  }

const TIME_THRESHOLD_SECONDS = 15 // Conversas criadas com menos de 15s de diferença

/**
 * Agrupa conversas que foram criadas em lote
 * @param conversations - Lista de conversas ordenadas por updatedAt desc
 * @returns Lista com cabeçalhos de grupo inseridos onde apropriado
 */
export function groupRecentBroadcasts(
  conversations: ConversationData[]
): GroupedItem[] {
  if (conversations.length === 0) return []

  const result: GroupedItem[] = []
  let i = 0

  while (i < conversations.length) {
    const current = conversations[i]

    // Verifica se deve iniciar um grupo
    if (
      current.audienceType === "CLASS" &&
      current.class &&
      current.subject
    ) {
      // Coleta todas as conversas consecutivas que pertencem ao mesmo grupo
      const groupMembers: ConversationData[] = [current]
      let j = i + 1

      while (j < conversations.length) {
        const next = conversations[j]

        // Verifica se pertence ao mesmo grupo
        const isSameSubject = next.subject === current.subject
        const isSameClass =
          next.audienceType === "CLASS" &&
          next.class?.id === current.class?.id
        const timeDiff = Math.abs(
          current.timestamp.getTime() - next.timestamp.getTime()
        )
        const isWithinTimeWindow = timeDiff / 1000 <= TIME_THRESHOLD_SECONDS

        if (isSameSubject && isSameClass && isWithinTimeWindow) {
          groupMembers.push(next)
          j++
        } else {
          break
        }
      }

      // Se encontrou grupo (2 ou mais conversas), insere como grupo
      if (groupMembers.length >= 2) {
        result.push({
          type: "group",
          turma: current.class!.name,
          count: groupMembers.length,
          id: `group-${current.class!.id}-${current.timestamp.getTime()}`,
          conversations: groupMembers,
        })
      } else {
        // Se for apenas 1, adiciona como conversa normal
        result.push({
          type: "conversation",
          data: current,
        })
      }

      i = j // Avança para próxima conversa não processada
    } else {
      // Conversa não pertence a grupo, adiciona normalmente
      result.push({
        type: "conversation",
        data: current,
      })
      i++
    }
  }

  return result
}
