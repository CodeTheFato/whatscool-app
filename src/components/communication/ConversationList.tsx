import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessagesSquare, Plus, Search } from "lucide-react"
import ConversationListItem from "./ConversationListItem"
import EmptyState from "./EmptyState"
import type { Conversation } from "./types"

interface ConversationListProps {
  conversations: Conversation[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  unreadOnly: boolean
  onUnreadOnlyChange: (value: boolean) => void
  unreadCount: number
  canCreateConversation: boolean
  onNewConversation?: () => void
}

export default function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  unreadOnly,
  onUnreadOnlyChange,
  unreadCount,
  canCreateConversation,
  onNewConversation,
}: ConversationListProps) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Conversas</CardTitle>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white border-0">
              {unreadCount} nao {unreadCount === 1 ? "lida" : "lidas"}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10 border-2"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={!unreadOnly ? "default" : "outline"}
              onClick={() => onUnreadOnlyChange(false)}
              className={
                !unreadOnly
                  ? "bg-violet-100 hover:bg-violet-200 text-violet-900 border-violet-200"
                  : ""
              }
            >
              Todas
            </Button>
            <Button
              size="sm"
              variant={unreadOnly ? "default" : "outline"}
              onClick={() => onUnreadOnlyChange(true)}
              className={
                unreadOnly
                  ? "bg-violet-100 hover:bg-violet-200 text-violet-900 border-violet-200"
                  : ""
              }
            >
              Nao lidas
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm">Carregando...</p>
            </div>
          ) : conversations.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="Nenhuma conversa ainda"
              description={
                canCreateConversation
                  ? "Conversas aparecerão quando responsáveis responderem a um comunicado, ou quando você iniciar uma conversa direta."
                  : "Responda a um comunicado para iniciar uma conversa."
              }
            >
              {canCreateConversation && onNewConversation && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={onNewConversation}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova conversa
                </Button>
              )}
            </EmptyState>
          ) : (
            conversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isActive={selectedId === conv.id}
                onClick={() => onSelect(conv.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
