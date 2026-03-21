import ConversationList from "./ConversationList"
import ChatPanel from "./ChatPanel"
import type { Conversation } from "./types"

interface ConversationsTabProps {
  conversations: Conversation[]
  isLoadingConversations: boolean
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  activeConversation: Conversation | null
  isLoadingActiveConversation: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  unreadOnly: boolean
  onUnreadOnlyChange: (value: boolean) => void
  chatUnreadCount: number
  replyText: string
  onReplyTextChange: (text: string) => void
  isSendingReply: boolean
  onSendReply: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  canCreateConversation: boolean
  onNewConversation?: () => void
}

export default function ConversationsTab({
  conversations,
  isLoadingConversations,
  selectedConversationId,
  onSelectConversation,
  activeConversation,
  isLoadingActiveConversation,
  searchQuery,
  onSearchChange,
  unreadOnly,
  onUnreadOnlyChange,
  chatUnreadCount,
  replyText,
  onReplyTextChange,
  isSendingReply,
  onSendReply,
  messagesEndRef,
  canCreateConversation,
  onNewConversation,
}: ConversationsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <div className="lg:col-span-3">
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConversations}
          selectedId={selectedConversationId}
          onSelect={onSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          unreadOnly={unreadOnly}
          onUnreadOnlyChange={onUnreadOnlyChange}
          unreadCount={chatUnreadCount}
          canCreateConversation={canCreateConversation}
          onNewConversation={onNewConversation}
        />
      </div>
      <div className="lg:col-span-4">
        <ChatPanel
          conversation={activeConversation}
          isLoading={isLoadingActiveConversation}
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          isSending={isSendingReply}
          onSendReply={onSendReply}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  )
}
