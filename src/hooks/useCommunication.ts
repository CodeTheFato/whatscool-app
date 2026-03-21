"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import type {
  CommunicationConfig,
  AnnouncementItem,
  Conversation,
  ChatMessage,
  UseCommunicationReturn,
} from "@/components/communication/types"

// ==================== MAPPERS ====================

/** Maps staff API conversation response → normalized Conversation */
function mapStaffConversation(conv: any): Conversation {
  const lastMessage = conv.messages[0]
  const parents = conv.participants.filter((p: any) => p.user.role === "PARENT")
  const firstParent = parents[0]?.user

  let studentName = "Aluno"
  if (firstParent?.parent?.students && firstParent.parent.students.length > 0) {
    studentName = firstParent.parent.students[0].user.name
  }

  const messages: ChatMessage[] = conv.messages
    .map((msg: any) => ({
      id: msg.id,
      content: msg.body,
      timestamp: new Date(msg.createdAt),
      senderName: msg.sender.name || msg.sender.role,
      isOwn: msg.sender.role !== "PARENT",
    }))
    .reverse()

  return {
    id: conv.id,
    subject: conv.announcement?.title || conv.subject || "Conversa interna",
    displayName: firstParent?.name || "Responsável",
    displaySubtitle: studentName,
    announcementId: conv.announcementId || null,
    unread: conv.unread || false,
    timestamp: new Date(lastMessage?.createdAt || conv.createdAt),
    status: conv.status,
    lastMessagePreview: lastMessage?.body || null,
    messages,
  }
}

/** Maps staff API conversation detail → normalized Conversation */
function mapStaffConversationDetail(data: any): Conversation {
  const parents = data.participants.filter((p: any) => p.user.role === "PARENT")
  const firstParent = parents[0]?.user

  let studentName = "Aluno"
  if (firstParent?.parent?.students && firstParent.parent.students.length > 0) {
    studentName = firstParent.parent.students[0].user.name
  }

  const messages: ChatMessage[] = data.messages.map((msg: any) => ({
    id: msg.id,
    content: msg.body,
    timestamp: new Date(msg.createdAt),
    senderName: msg.sender.name || msg.sender.role,
    isOwn: msg.sender.role !== "PARENT",
  }))

  return {
    id: data.id,
    subject: data.announcement?.title || data.subject || "Conversa interna",
    displayName: firstParent?.name || "Responsável",
    displaySubtitle: studentName,
    announcementId: data.announcementId || null,
    unread: false,
    timestamp: new Date(data.createdAt),
    status: data.status,
    lastMessagePreview: null,
    messages,
  }
}

/** Maps parent API conversation list item → normalized Conversation */
function mapParentConversation(conv: any): Conversation {
  return {
    id: conv.id,
    subject: conv.subject,
    displayName: conv.schoolSenderName || "Escola",
    displaySubtitle: "",
    announcementId: conv.announcementId || null,
    unread: conv.unread || false,
    timestamp: new Date(conv.timestamp || conv.updatedAt || conv.createdAt),
    status: conv.status || "OPEN",
    lastMessagePreview: conv.lastMessage?.content || null,
    messages: [],
  }
}

/** Maps parent API conversation detail → normalized Conversation */
function mapParentConversationDetail(data: any): Conversation {
  const messages: ChatMessage[] = (data.messages || []).map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    timestamp: new Date(msg.createdAt),
    senderName: msg.sender?.name || "Usuário",
    isOwn: !msg.isFromSchool,
  }))

  return {
    id: data.id,
    subject: data.subject,
    displayName: data.participants?.[0]?.name || "Escola",
    displaySubtitle: data.student?.name || "",
    announcementId: data.announcementId || null,
    unread: false,
    timestamp: new Date(data.createdAt),
    status: data.status || "OPEN",
    lastMessagePreview: null,
    messages,
  }
}

// ==================== HOOK ====================

export function useCommunication(config: CommunicationConfig): UseCommunicationReturn {
  const isStaff = config.role === "secretary" || config.role === "teacher"

  // Tab
  const [activeTab, setActiveTab] = useState("comunicados")

  // Announcements
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null)
  const [announcementReply, setAnnouncementReply] = useState("")
  const [isSendingAnnouncementReply, setIsSendingAnnouncementReply] = useState(false)

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [isLoadingActiveConversation, setIsLoadingActiveConversation] = useState(false)

  // Chat
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)

  // Badges
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ==================== FETCH FUNCTIONS ====================

  const fetchAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true)
    try {
      const response = await fetch(config.endpoints.announcements)
      if (!response.ok) throw new Error("Erro ao buscar comunicados")
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error("Erro ao buscar comunicados:", error)
    } finally {
      setIsLoadingAnnouncements(false)
    }
  }, [config.endpoints.announcements])

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const params = new URLSearchParams()
      if (unreadOnly) params.set("unread", "true")
      if (searchQuery) params.set("search", searchQuery)

      const response = await fetch(`${config.endpoints.conversations}?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao buscar conversas")
      const data = await response.json()

      const mapped = isStaff
        ? data.map(mapStaffConversation)
        : data.map(mapParentConversation)

      setConversations(mapped)
    } catch (error) {
      console.error("Erro ao buscar conversas:", error)
      toast.error("Erro ao carregar conversas")
    } finally {
      setIsLoadingConversations(false)
    }
  }, [config.endpoints.conversations, unreadOnly, searchQuery, isStaff])

  const fetchBadges = useCallback(async () => {
    if (!config.endpoints.badges) {
      // Parents compute badges from local data
      setChatUnreadCount(conversations.filter((c) => c.unread).length)
      setAnnouncementUnreadCount(announcements.filter((a) => a.unread).length)
      return
    }
    try {
      const response = await fetch(config.endpoints.badges)
      if (!response.ok) return
      const data = await response.json()
      setChatUnreadCount(data.chatUnreadCount || 0)
      setAnnouncementUnreadCount(data.announcementUnreadCount || 0)
    } catch (error) {
      console.error("Erro ao buscar badges:", error)
    }
  }, [config.endpoints.badges, conversations, announcements])

  const fetchConversationDetail = useCallback(
    async (conversationId: string) => {
      setIsLoadingActiveConversation(true)
      try {
        const response = await fetch(config.endpoints.conversationDetail(conversationId))
        if (!response.ok) throw new Error("Erro ao buscar conversa")
        const data = await response.json()

        const mapped = isStaff
          ? mapStaffConversationDetail(data)
          : mapParentConversationDetail(data)

        setActiveConversation(mapped)

        // Mark as read locally
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unread: false } : conv
          )
        )
      } catch (error) {
        console.error("Erro ao buscar conversa:", error)
        toast.error("Erro ao carregar conversa")
      } finally {
        setIsLoadingActiveConversation(false)
      }
    },
    [config.endpoints, isStaff]
  )

  // ==================== ACTIONS ====================

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedConversationId || !activeConversation) return

    setIsSendingReply(true)
    try {
      const response = await fetch(
        config.endpoints.conversationMessages(selectedConversationId),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isStaff
              ? { body: replyText.trim() }
              : { content: replyText.trim() }
          ),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao enviar mensagem")
      }

      const result = await response.json()
      const newMsg = isStaff ? result : result.data

      setActiveConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: newMsg.id,
              content: newMsg.body || newMsg.content,
              timestamp: new Date(newMsg.createdAt),
              senderName: newMsg.sender?.name || "Você",
              isOwn: true,
            },
          ],
        }
      })

      setReplyText("")
      toast.success("Mensagem enviada!")
      fetchConversations()
      if (config.endpoints.badges) fetchBadges()
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao enviar resposta")
    } finally {
      setIsSendingReply(false)
    }
  }, [
    replyText,
    selectedConversationId,
    activeConversation,
    config.endpoints,
    isStaff,
    fetchConversations,
    fetchBadges,
  ])

  const handleReplyToAnnouncement = useCallback(async () => {
    if (
      !announcementReply.trim() ||
      !selectedAnnouncement ||
      isSendingAnnouncementReply ||
      !config.endpoints.announcementReply
    )
      return

    setIsSendingAnnouncementReply(true)
    try {
      const response = await fetch(
        config.endpoints.announcementReply(selectedAnnouncement.id),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: announcementReply.trim() }),
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erro ao responder comunicado")
      }

      const data = await response.json()
      toast.success("Resposta enviada!", {
        description: "Uma conversa foi criada com a escola.",
      })

      setAnnouncementReply("")
      setSelectedAnnouncement(null)

      await fetchConversations()
      if (data.conversationId) {
        setSelectedConversationId(data.conversationId)
        setActiveTab("conversas")
      }
    } catch (error) {
      console.error("Erro ao responder comunicado:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao responder comunicado")
    } finally {
      setIsSendingAnnouncementReply(false)
    }
  }, [
    announcementReply,
    selectedAnnouncement,
    isSendingAnnouncementReply,
    config.endpoints,
    fetchConversations,
  ])

  // ==================== POLLING ====================

  const pollForNewMessages = useCallback(
    async (conversationId: string) => {
      if (!activeConversation) return

      const lastMessageId =
        activeConversation.messages[activeConversation.messages.length - 1]?.id
      if (!lastMessageId) return

      try {
        const response = await fetch(
          `${config.endpoints.conversationPoll(conversationId)}?lastMessageId=${lastMessageId}`
        )
        if (!response.ok) return

        const data = await response.json()

        if (data.hasNewMessages && data.messages.length > 0) {
          setActiveConversation((prev) => {
            if (!prev) return null

            const existingIds = new Set(prev.messages.map((m) => m.id))
            const newMessages: ChatMessage[] = data.messages
              .filter((msg: any) => !existingIds.has(msg.id))
              .map((msg: any) => ({
                id: msg.id,
                content: msg.body || msg.content,
                timestamp: new Date(msg.createdAt),
                senderName: msg.sender?.name || "Usuário",
                isOwn: isStaff ? msg.sender?.role !== "PARENT" : !msg.isFromSchool,
              }))

            if (newMessages.length === 0) return prev

            return {
              ...prev,
              messages: [...prev.messages, ...newMessages],
            }
          })

          if (config.endpoints.badges) fetchBadges()
        }
      } catch (error) {
        console.error("Erro no polling:", error)
      }
    },
    [activeConversation, config.endpoints, isStaff, fetchBadges]
  )

  // ==================== EFFECTS ====================

  // Initial load
  useEffect(() => {
    fetchAnnouncements()
    if (config.endpoints.badges) fetchBadges()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch conversations on filter change
  useEffect(() => {
    if (activeTab === "conversas") {
      fetchConversations()
    }
  }, [unreadOnly, searchQuery, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load conversation detail when selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationDetail(selectedConversationId)
    } else {
      setActiveConversation(null)
    }
  }, [selectedConversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to last message
  useEffect(() => {
    if (activeConversation?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeConversation?.messages])

  // Polling for new messages
  useEffect(() => {
    if (!selectedConversationId || !activeConversation) return

    const interval = setInterval(() => {
      pollForNewMessages(selectedConversationId)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedConversationId, activeConversation]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update local badge counts for parents (no badge endpoint)
  useEffect(() => {
    if (!config.endpoints.badges) {
      setChatUnreadCount(conversations.filter((c) => c.unread).length)
      setAnnouncementUnreadCount(announcements.filter((a: any) => a.unread).length)
    }
  }, [conversations, announcements, config.endpoints.badges])

  // ==================== REFRESH ====================

  const refreshAfterAction = useCallback(async () => {
    await fetchConversations()
    if (config.endpoints.badges) await fetchBadges()
    await fetchAnnouncements()
  }, [fetchConversations, fetchBadges, fetchAnnouncements])

  return {
    activeTab,
    setActiveTab,
    announcements,
    isLoadingAnnouncements,
    selectedAnnouncement,
    setSelectedAnnouncement,
    announcementReply,
    setAnnouncementReply,
    isSendingAnnouncementReply,
    handleReplyToAnnouncement,
    conversations,
    isLoadingConversations,
    selectedConversationId,
    setSelectedConversationId,
    activeConversation,
    isLoadingActiveConversation,
    replyText,
    setReplyText,
    isSendingReply,
    handleSendReply,
    searchQuery,
    setSearchQuery,
    unreadOnly,
    setUnreadOnly,
    chatUnreadCount,
    announcementUnreadCount,
    messagesEndRef,
    refreshAfterAction,
    fetchAnnouncements,
  }
}
