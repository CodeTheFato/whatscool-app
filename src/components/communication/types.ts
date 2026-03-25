import type { LucideIcon } from "lucide-react"

// ==================== ROLE CONFIG ====================
export type CommunicationRole = "secretary" | "teacher" | "parents"

export interface CommunicationConfig {
  role: CommunicationRole
  pageTitle: string
  pageDescription: string

  // Feature flags
  canCreateAnnouncement: boolean
  canCreateConversation: boolean
  canReplyToAnnouncement: boolean
  showAnnouncementStats: boolean
  showAnnouncementReadStatus: boolean

  // API endpoints
  endpoints: {
    announcements: string
    conversations: string
    conversationDetail: (id: string) => string
    conversationMessages: (id: string) => string
    conversationPoll: (id: string) => string
    badges?: string
    announcementReply?: (id: string) => string
    announcementMarkRead?: (id: string) => string
    announcementConfirm?: (id: string) => string
    announcementRecipients?: (id: string) => string
  }
}

// ==================== DATA TYPES ====================
export interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  senderName: string
  isOwn: boolean
}

export interface Conversation {
  id: string
  subject: string
  displayName: string
  displaySubtitle: string
  announcementId: string | null
  unread: boolean
  timestamp: Date
  status: "OPEN" | "CLOSED"
  lastMessagePreview: string | null
  messages: ChatMessage[]
}

export interface AnnouncementItem {
  id: string
  title: string | null
  content: string
  category: string
  audienceType: string
  class: { id: string; name: string; grade: string } | null
  student: { id: string; user: { name: string } } | null
  creator: { id: string; name: string; role: string }
  publishedAt: string | null
  createdAt: string
  // Staff-only
  totalRecipients?: number
  totalConversations?: number
  totalRead?: number
  totalConfirmed?: number
  // Parent-only
  status?: string
  readAt?: string | null
  confirmedAt?: string | null
  deliveredAt?: string | null
  unread?: boolean
  // Shared
  allowReplies?: boolean
  requiresConfirmation?: boolean
  notifyViaWhatsapp?: boolean
  provider?: string
}

export interface CategoryInfo {
  id: string
  label: string
  icon: LucideIcon
  color: string
  bg: string
}

// ==================== RECIPIENT DETAIL ====================
export interface RecipientDetail {
  userId: string
  name: string
  avatar: string | null
  status: string
  readAt: string | null
  confirmedAt: string | null
}

// ==================== HOOK RETURN ====================
export interface UseCommunicationReturn {
  // Tab
  activeTab: string
  setActiveTab: (tab: string) => void

  // Announcements
  announcements: AnnouncementItem[]
  isLoadingAnnouncements: boolean
  selectedAnnouncement: AnnouncementItem | null
  setSelectedAnnouncement: (ann: AnnouncementItem | null) => void
  announcementReply: string
  setAnnouncementReply: (text: string) => void
  isSendingAnnouncementReply: boolean
  handleReplyToAnnouncement: () => Promise<void>

  // Conversations
  conversations: Conversation[]
  isLoadingConversations: boolean
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void
  activeConversation: Conversation | null
  isLoadingActiveConversation: boolean

  // Chat
  replyText: string
  setReplyText: (text: string) => void
  isSendingReply: boolean
  handleSendReply: () => Promise<void>

  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  unreadOnly: boolean
  setUnreadOnly: (value: boolean) => void

  // Badges
  chatUnreadCount: number
  announcementUnreadCount: number

  // Scroll ref
  messagesEndRef: React.RefObject<HTMLDivElement | null>

  // Confirmation
  handleConfirm: (announcementId: string) => Promise<void>
  isConfirming: boolean

  // Staff recipient details
  recipientDetails: RecipientDetail[] | null
  isLoadingRecipients: boolean

  // Refresh
  refreshAfterAction: () => Promise<void>
  fetchAnnouncements: () => Promise<void>
}
