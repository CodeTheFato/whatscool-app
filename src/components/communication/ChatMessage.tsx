import { CheckCheck } from "lucide-react"
import type { ChatMessage as ChatMessageType } from "./types"

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
          message.isOwn
            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
            : "bg-white border-2 border-gray-100 rounded-tl-sm"
        }`}
      >
        {!message.isOwn && (
          <p className="text-xs font-semibold mb-1 text-muted-foreground">
            {message.senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <div
          className={`flex items-center justify-end gap-1 text-[10px] mt-2 ${
            message.isOwn ? "text-white/70" : "text-gray-500"
          }`}
        >
          <span>
            {message.timestamp.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.isOwn && <CheckCheck className="h-3 w-3" />}
        </div>
      </div>
    </div>
  )
}
