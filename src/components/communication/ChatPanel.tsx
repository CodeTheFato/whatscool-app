import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { BellRing, MessageSquare, MessagesSquare, Send } from "lucide-react"
import ChatMessage from "./ChatMessage"
import type { Conversation } from "./types"

interface ChatPanelProps {
  conversation: Conversation | null
  isLoading: boolean
  replyText: string
  onReplyTextChange: (text: string) => void
  isSending: boolean
  onSendReply: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatPanel({
  conversation,
  isLoading,
  replyText,
  onReplyTextChange,
  isSending,
  onSendReply,
  messagesEndRef,
}: ChatPanelProps) {
  if (!conversation) {
    return (
      <Card className="border-0 shadow-xl h-[850px] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="h-10 w-10 text-blue-300" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">Selecione uma conversa</p>
          <p className="text-sm text-muted-foreground">
            Escolha uma conversa da lista para visualizar
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl h-[850px] flex flex-col overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                {conversation.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{conversation.subject}</CardTitle>
              <CardDescription className="text-xs">
                {conversation.displayName}
                {conversation.displaySubtitle && ` \u2022 ${conversation.displaySubtitle}`}
              </CardDescription>
            </div>
          </div>
          {conversation.announcementId ? (
            <Badge className="bg-purple-100 text-purple-700 border-0 gap-1">
              <BellRing className="h-3 w-3" />
              Via Comunicado
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-700 border-0 gap-1">
              <MessagesSquare className="h-3 w-3" />
              Conversa Direta
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="h-[650px] p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Reply input */}
      <Separator className="flex-shrink-0" />
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Textarea
            placeholder="Digite sua resposta..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none border-2"
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSendReply()
              }
            }}
            disabled={isSending}
          />
          <Button
            size="icon"
            className="h-[60px] w-[60px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={onSendReply}
            disabled={!replyText.trim() || isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
