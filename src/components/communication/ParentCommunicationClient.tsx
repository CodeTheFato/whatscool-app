"use client"

import { CommunicationPage } from "@/components/communication"
import type { CommunicationConfig } from "@/components/communication"

const config: CommunicationConfig = {
  role: "parents",
  pageTitle: "Mensagens da Escola",
  pageDescription: "Comunicação com a escola do seu filho",
  canCreateAnnouncement: false,
  canCreateConversation: true,
  canReplyToAnnouncement: true,
  showAnnouncementStats: false,
  showAnnouncementReadStatus: true,
  endpoints: {
    announcements: "/api/announcements",
    conversations: "/api/parents/conversations",
    conversationDetail: (id) => `/api/parents/conversations/${id}`,
    conversationMessages: (id) => `/api/parents/conversations/${id}`,
    conversationPoll: (id) => `/api/parents/conversations/${id}/poll`,
    announcementReply: (id) => `/api/announcements/${id}/reply`,
    announcementMarkRead: (id) => `/api/announcements/${id}/read`,
    announcementConfirm: (id) => `/api/announcements/${id}/confirm`,
  },
}

export default function ParentCommunicationClient() {
  return <CommunicationPage config={config} />
}
