"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Send,
  Search,
  MessagesSquare,
  User,
  School,
  Users,
} from "lucide-react"
import { toast } from "sonner"

// Tipos
type ConversationType = "DIRECT" | "BROADCAST"

interface Conversation {
  id: string
  type: ConversationType
  subject: string
  audienceType: string | null
  unread: boolean
  timestamp: Date | string
  origin: string
  class: { id: string; name: string; grade: string } | null
  student: { id: string; user: { name: string } } | null
  schoolSenderName: string
  lastMessage: {
    content: string
    createdAt: Date | string
    senderName: string
  } | null
}

interface Message {
  id: string
  content: string
  createdAt: Date | string
  sender: {
    id: string
    name: string
  }
  isFromSchool: boolean
}

interface ConversationDetail {
  id: string
  type: ConversationType
  subject: string
  audienceType: string | null
  createdAt: Date | string
  class: { id: string; name: string; grade: string } | null
  student: { id: string; name: string } | null
  messages: Message[]
  participants: { id: string; name: string }[]
}

export default function ParentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const params = new URLSearchParams()
      if (unreadOnly) params.set('unread', 'true')
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/parents/conversations?${params.toString()}`)
      if (!response.ok) throw new Error('Erro ao buscar conversas')

      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Fetch conversation details and messages
  const fetchConversationDetails = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/parents/conversations/${conversationId}`)
      if (!response.ok) throw new Error('Erro ao buscar mensagens')

      const data = await response.json()
      setActiveConversation(data)

      // Atualiza o status de unread na lista
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread: false } : conv
        )
      )
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedConversationId || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/parents/conversations/${selectedConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      })

      if (!response.ok) throw new Error('Erro ao enviar mensagem')

      const result = await response.json()

      // Adiciona a mensagem ao chat local
      if (activeConversation) {
        setActiveConversation({
          ...activeConversation,
          messages: [
            ...activeConversation.messages,
            {
              id: result.data.id,
              content: result.data.content,
              createdAt: result.data.createdAt,
              sender: result.data.sender,
              isFromSchool: false,
            },
          ],
        })
      }

      setReplyText('')
      toast.success('Mensagem enviada com sucesso')

      // Atualiza a lista de conversas
      fetchConversations()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsSending(false)
    }
  }

  // Polling para novas mensagens
  const pollForNewMessages = async (conversationId: string) => {
    if (!activeConversation) return

    const lastMessageId = activeConversation.messages[activeConversation.messages.length - 1]?.id
    if (!lastMessageId) return

    try {
      const response = await fetch(`/api/parents/conversations/${conversationId}/poll?lastMessageId=${lastMessageId}`)
      if (!response.ok) return

      const data = await response.json()

      if (data.hasNewMessages && data.messages.length > 0) {
        setActiveConversation(prev => {
          if (!prev) return null

          // Filtra mensagens que já não existem (evita duplicatas)
          const existingIds = new Set(prev.messages.map(m => m.id))
          const newMessages = data.messages.filter((msg: any) => !existingIds.has(msg.id))

          if (newMessages.length === 0) return prev

          return {
            ...prev,
            messages: [...prev.messages, ...newMessages]
          }
        })
      }
    } catch (error) {
      console.error('Erro no polling:', error)
    }
  }

  // Initial load
  useEffect(() => {
    fetchConversations()
  }, [])

  // Refetch on filter changes
  useEffect(() => {
    fetchConversations()
  }, [unreadOnly, searchQuery])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationDetails(selectedConversationId)
    } else {
      setActiveConversation(null)
    }
  }, [selectedConversationId])

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (activeConversation?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeConversation?.messages])

  // Polling para novas mensagens na conversa ativa
  useEffect(() => {
    if (!selectedConversationId || !activeConversation) return

    const interval = setInterval(() => {
      pollForNewMessages(selectedConversationId)
    }, 5000) // Poll a cada 5 segundos

    return () => clearInterval(interval)
  }, [selectedConversationId, activeConversation])

  const unreadCount = conversations.filter(c => c.unread).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mensagens da Escola
              </h1>
              <p className="text-sm text-muted-foreground">
                Comunicação com a escola do seu filho
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Conversas</CardTitle>
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={!unreadOnly ? "default" : "outline"}
                      onClick={() => setUnreadOnly(false)}
                      className={!unreadOnly ? "bg-violet-100 hover:bg-violet-200 text-violet-900 border-violet-200" : ""}
                    >
                      Todas
                    </Button>
                    <Button
                      size="sm"
                      variant={unreadOnly ? "default" : "outline"}
                      onClick={() => setUnreadOnly(true)}
                      className={unreadOnly ? "bg-violet-100 hover:bg-violet-200 text-violet-900 border-violet-200" : ""}
                    >
                      Não lidas
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-2">
                  {isLoadingConversations ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="text-sm">Carregando...</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessagesSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Nenhuma conversa encontrada</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isActive = selectedConversationId === conv.id

                      return (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversationId(conv.id)}
                          className={`w-full p-4 rounded-xl text-left transition-all ${isActive
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-white hover:bg-gray-50 border-2"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={isActive ? "bg-white/20 text-white" : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"}>
                                  {conv.schoolSenderName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
                                  {conv.schoolSenderName}
                                </p>
                                {conv.type === "BROADCAST" && conv.class && (
                                  <p className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                                    📢 Comunicado para {conv.class.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            {conv.unread && (
                              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-sm font-semibold mb-1 truncate ${isActive ? "text-white" : "text-gray-800"}`}>
                            {conv.subject}
                          </p>

                          {/* Context chips */}
                          {conv.student && (
                            <Badge className={`mb-1 text-[10px] ${isActive ? "bg-white/20 text-white border-white/30" : "bg-blue-100 text-blue-700 border-0"}`}>
                              <User className="h-3 w-3 mr-1" />
                              {conv.student.user.name}
                            </Badge>
                          )}

                          {conv.lastMessage && (
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-xs truncate flex-1 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                                {conv.lastMessage.content.slice(0, 50)}...
                              </p>
                              <span className={`text-[10px] ml-2 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                                {new Date(conv.timestamp).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-4">
            {selectedConversationId && activeConversation ? (
              <Card className="border-0 shadow-xl h-[850px] flex flex-col overflow-hidden">
                <CardHeader className="border-b flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                        {activeConversation.participants[0]?.name.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{activeConversation.subject}</CardTitle>
                      <CardDescription className="text-xs">
                        {activeConversation.type === "BROADCAST" && activeConversation.class && (
                          <span>📢 Comunicado para {activeConversation.class.name}</span>
                        )}
                        {activeConversation.student && (
                          <span>Sobre {activeConversation.student.name}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <ScrollArea className="h-[650px] p-6">
                  {isLoadingMessages ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromSchool ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 shadow-md ${message.isFromSchool
                              ? "bg-white border-2 border-gray-100 rounded-tl-sm"
                              : "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                              }`}
                          >
                            {message.isFromSchool && (
                              <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                {message.sender.name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-2 text-xs ${message.isFromSchool ? "text-muted-foreground" : "text-white/80"
                                }`}
                            >
                              <span>
                                {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Âncora para auto-scroll */}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <Separator className="flex-shrink-0" />

                <div className="p-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none border-2"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="h-[60px] w-[60px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={handleSendMessage}
                      disabled={!replyText.trim() || isSending}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl h-[744px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Selecione uma conversa</p>
                  <p className="text-sm">Escolha uma conversa da lista para visualizar as mensagens</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
