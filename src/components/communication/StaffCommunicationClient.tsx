"use client"

import { useState, useRef, useMemo } from "react"
import { toast } from "sonner"
import { CommunicationPage } from "@/components/communication"
import type { CommunicationConfig, CommunicationRole, UseCommunicationReturn } from "@/components/communication"
import NewCommunicationModal from "@/components/communication/NewCommunicationModal"
import type { ClassData, StudentData } from "@/components/communication/NewCommunicationModal"

const staffConfigs: Record<"secretary" | "teacher", CommunicationConfig> = {
  secretary: {
    role: "secretary",
    pageTitle: "Comunicação",
    pageDescription: "Envie comunicados e gerencie conversas com responsáveis",
    canCreateAnnouncement: true,
    canCreateConversation: true,
    canReplyToAnnouncement: false,
    showAnnouncementStats: true,
    showAnnouncementReadStatus: false,
    endpoints: {
      announcements: "/api/announcements",
      conversations: "/api/chat/conversations",
      conversationDetail: (id) => `/api/chat/conversations/${id}`,
      conversationMessages: (id) => `/api/chat/conversations/${id}/messages`,
      conversationPoll: (id) => `/api/chat/conversations/${id}/poll`,
      badges: "/api/chat/conversations/badges",
      announcementRecipients: (id) => `/api/announcements/${id}/recipients`,
    },
  },
  teacher: {
    role: "teacher",
    pageTitle: "Comunicação",
    pageDescription: "Envie comunicados e converse com responsáveis das suas turmas",
    canCreateAnnouncement: true,
    canCreateConversation: true,
    canReplyToAnnouncement: false,
    showAnnouncementStats: true,
    showAnnouncementReadStatus: false,
    endpoints: {
      announcements: "/api/announcements",
      conversations: "/api/chat/conversations",
      conversationDetail: (id) => `/api/chat/conversations/${id}`,
      conversationMessages: (id) => `/api/chat/conversations/${id}/messages`,
      conversationPoll: (id) => `/api/chat/conversations/${id}/poll`,
      badges: "/api/chat/conversations/badges",
      announcementRecipients: (id) => `/api/announcements/${id}/recipients`,
    },
  },
}

interface StaffCommunicationClientProps {
  role: "secretary" | "teacher"
  initialClasses: ClassData[]
  initialStudents: StudentData[]
}

export default function StaffCommunicationClient({
  role,
  initialClasses,
  initialStudents,
}: StaffCommunicationClientProps) {
  const [showModal, setShowModal] = useState(false)
  const hookRef = useRef<UseCommunicationReturn | null>(null)
  const config = staffConfigs[role]

  return (
    <>
      <CommunicationPage
        config={config}
        onNewCommunication={() => setShowModal(true)}
        hookRef={hookRef}
      />
      <NewCommunicationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        classes={initialClasses}
        students={initialStudents}
        isLoadingRecipients={false}
        onSendAnnouncement={async (payload) => {
          const response = await fetch("/api/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || "Erro ao enviar comunicado")
          }
          const data = await response.json()
          const count = data.stats?.recipientsCount ?? data.recipientCount ?? 0
          const providers = data.stats?.providers ?? ["PLATFORM"]
          toast.success("Comunicado publicado!", {
            description: `${count} destinatário(s) notificados via ${providers.join(" + ")}.${payload.requiresConfirmation ? " Confirmação de leitura será exigida." : ""}`,
          })
          setShowModal(false)
          hookRef.current?.refreshAfterAction()
        }}
        onCreateConversation={async (payload) => {
          const response = await fetch("/api/chat/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || "Erro ao criar conversa")
          }
          toast.success("Conversa iniciada!", {
            description: "A conversa aparecerá na aba Conversas.",
          })
          setShowModal(false)
          hookRef.current?.setActiveTab("conversas")
          hookRef.current?.refreshAfterAction()
        }}
      />
    </>
  )
}
