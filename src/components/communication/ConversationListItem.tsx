import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, MessageSquare } from "lucide-react"
import type { Conversation } from "./types"

interface ConversationListItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export default function ConversationListItem({
  conversation: conv,
  isActive,
  onClick,
}: ConversationListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-left transition-all ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
          : "bg-white hover:bg-gray-50 border-2"
      }`}
    >
      {/* Badge tipo */}
      <div className="mb-1.5">
        {conv.announcementId ? (
          <Badge
            className={`text-[10px] gap-1 ${
              isActive
                ? "bg-white/20 text-white border-white/30"
                : "bg-purple-100 text-purple-700 border-0"
            }`}
          >
            <GraduationCap className="h-3 w-3" />
            Resposta ao comunicado
          </Badge>
        ) : (
          <Badge
            className={`text-[10px] gap-1 ${
              isActive
                ? "bg-white/20 text-white border-white/30"
                : "bg-blue-100 text-blue-700 border-0"
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            Conversa direta
          </Badge>
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className={
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
              }
            >
              {conv.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
              {conv.displayName}
            </p>
            {conv.displaySubtitle && (
              <p className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                {conv.displaySubtitle}
              </p>
            )}
          </div>
        </div>
        {conv.unread && <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />}
      </div>

      {/* Subject */}
      <p
        className={`text-sm font-semibold mb-1 truncate ${
          isActive ? "text-white" : "text-gray-800"
        }`}
      >
        {conv.subject}
      </p>

      {/* Last message preview */}
      {conv.lastMessagePreview && (
        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-xs truncate flex-1 ${
              isActive ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            {conv.lastMessagePreview.slice(0, 50)}...
          </p>
          <span
            className={`text-[10px] ml-2 ${isActive ? "text-white/70" : "text-muted-foreground"}`}
          >
            {conv.timestamp.toLocaleDateString("pt-BR")}
          </span>
        </div>
      )}
    </button>
  )
}
