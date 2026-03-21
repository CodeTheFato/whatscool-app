import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Send } from "lucide-react"
import type { AnnouncementItem, CategoryInfo } from "./types"

interface AnnouncementReplyPanelProps {
  announcement: AnnouncementItem
  categoryInfo: CategoryInfo
  replyText: string
  onReplyTextChange: (text: string) => void
  isSending: boolean
  onSendReply: () => void
}

export default function AnnouncementReplyPanel({
  announcement,
  categoryInfo: catInfo,
  replyText,
  onReplyTextChange,
  isSending,
  onSendReply,
}: AnnouncementReplyPanelProps) {
  const CatIcon = catInfo.icon

  return (
    <Card className="border-0 shadow-xl sticky top-8">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${catInfo.bg} flex items-center justify-center`}>
            <CatIcon className={`h-5 w-5 ${catInfo.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {announcement.title || "Sem titulo"}
            </CardTitle>
            <CardDescription className="text-xs">
              {announcement.creator?.name} &bull;{" "}
              {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString(
                "pt-BR"
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 mb-6">
          {announcement.content}
        </p>

        <Separator className="mb-4" />

        <div className="space-y-3">
          {announcement.allowReplies !== false ? (
            <>
              <p className="text-sm font-medium text-gray-700">Responder ao comunicado</p>
              <Textarea
                placeholder="Digite sua resposta..."
                className="min-h-[100px] resize-none border-2 focus:border-purple-400 transition-colors"
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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20"
                onClick={onSendReply}
                disabled={!replyText.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                Sua resposta criara uma conversa na aba &quot;Conversas&quot;
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Respostas bloqueadas</p>
                <p className="text-xs text-gray-400">
                  Este comunicado nao aceita respostas no momento.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
