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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Send,
  Search,
  MessagesSquare,
  BellRing,
  Clock,
  DollarSign,
  AlertCircle,
  Megaphone,
  Users,
  CheckCheck,
  Lock,
  Unlock,
  GraduationCap,
  Smartphone,
  Monitor,
} from "lucide-react"
import { toast } from "sonner"

// ==================== TYPES ====================
interface Conversation {
  id: string
  subject: string
  announcementId: string | null
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
  subject: string
  announcementId: string | null
  createdAt: Date | string
  class: { id: string; name: string; grade: string } | null
  student: { id: string; name: string } | null
  messages: Message[]
  participants: { id: string; name: string }[]
}

interface AnnouncementItem {
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
  status: string
  readAt: string | null
  deliveredAt: string | null
  unread: boolean
  allowReplies?: boolean
  notifyViaWhatsapp?: boolean
  provider?: string
}

// ==================== HELPERS ====================
const categories = [
  { id: "COMUNICADOS", label: "Comunicados", icon: BellRing, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "BOLETOS", label: "Boletos", icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
  { id: "ATRASO_BOLETOS", label: "Atraso de Boletos", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "AVISOS", label: "Avisos Gerais", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
]

const getCategoryInfo = (enumVal: string) => {
  return categories.find(c => c.id === enumVal) || categories[0]
}

// ==================== COMPONENT ====================
export default function ParentMessagesPage() {
  const [activeTab, setActiveTab] = useState<string>("comunicados")

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Announcements
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null)
  const [announcementReply, setAnnouncementReply] = useState("")
  const [isSendingAnnouncementReply, setIsSendingAnnouncementReply] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ==================== DATA FETCHING ====================
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

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true)
    try {
      const response = await fetch('/api/announcements')
      if (!response.ok) throw new Error('Erro ao buscar comunicados')
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('Erro ao buscar comunicados:', error)
    } finally {
      setIsLoadingAnnouncements(false)
    }
  }

  const fetchConversationDetails = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/parents/conversations/${conversationId}`)
      if (!response.ok) throw new Error('Erro ao buscar mensagens')

      const data = await response.json()
      setActiveConversation(data)

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

  // Send message in conversation
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
      fetchConversations()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsSending(false)
    }
  }

  // Reply to announcement (creates lazy conversation)
  const handleReplyToAnnouncement = async () => {
    if (!announcementReply.trim() || !selectedAnnouncement || isSendingAnnouncementReply) return

    setIsSendingAnnouncementReply(true)
    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncement.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcementReply.trim() }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Erro ao responder comunicado')
      }

      const data = await response.json()
      toast.success('Resposta enviada!', {
        description: 'Uma conversa foi criada com a escola.'
      })

      setAnnouncementReply('')
      setSelectedAnnouncement(null)

      // Refresh conversations and switch tab
      await fetchConversations()
      if (data.conversationId) {
        setSelectedConversationId(data.conversationId)
        setActiveTab('conversas')
      }
    } catch (error) {
      console.error('Erro ao responder comunicado:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao responder comunicado')
    } finally {
      setIsSendingAnnouncementReply(false)
    }
  }

  // Polling
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

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchConversations()
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (activeTab === 'conversas') {
      fetchConversations()
    }
  }, [unreadOnly, searchQuery, activeTab])

  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationDetails(selectedConversationId)
    } else {
      setActiveConversation(null)
    }
  }, [selectedConversationId])

  useEffect(() => {
    if (activeConversation?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeConversation?.messages])

  useEffect(() => {
    if (!selectedConversationId || !activeConversation) return

    const interval = setInterval(() => {
      pollForNewMessages(selectedConversationId)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedConversationId, activeConversation])

  const unreadCount = conversations.filter(c => c.unread).length
  const unreadAnnouncementCount = announcements.filter(a => a.unread).length

  // ==================== RENDER ====================
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
            <TabsTrigger
              value="comunicados"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Megaphone className="h-4 w-4" />
              Comunicados
              {unreadAnnouncementCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-1">
                  {unreadAnnouncementCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="conversas"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <MessagesSquare className="h-4 w-4" />
              Conversas
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: COMUNICADOS ==================== */}
          <TabsContent value="comunicados" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Announcement List */}
              <div className={selectedAnnouncement ? "lg:col-span-3" : "lg:col-span-5"}>
                <div className="space-y-4">
                  {isLoadingAnnouncements ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="text-sm">Carregando comunicados...</p>
                    </div>
                  ) : announcements.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardContent className="py-20 text-center">
                        <div className="h-20 w-20 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-5">
                          <Megaphone className="h-10 w-10 text-purple-300" />
                        </div>
                        <p className="text-xl font-bold text-gray-800 mb-2">Nenhum comunicado recebido</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">Você será notificado quando a escola enviar um novo comunicado.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    announcements.map((ann) => {
                      const catInfo = getCategoryInfo(ann.category)
                      const CatIcon = catInfo.icon
                      const isSelected = selectedAnnouncement?.id === ann.id

                      return (
                        <Card
                          key={ann.id}
                          className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${isSelected ? "ring-2 ring-purple-500 shadow-purple-100" : ""
                            }`}
                          onClick={() => setSelectedAnnouncement(isSelected ? null : ann)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`h-12 w-12 rounded-xl ${catInfo.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                                <CatIcon className={`h-6 w-6 ${catInfo.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <Badge variant="secondary" className={`${catInfo.bg} ${catInfo.color} border-0 text-xs font-medium`}>
                                    {catInfo.label}
                                  </Badge>
                                  {ann.unread && (
                                    <Badge className="bg-red-500 text-white border-0 text-[10px] animate-pulse">Novo</Badge>
                                  )}
                                  {ann.allowReplies !== false ? (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-0 text-[10px] gap-1">
                                      <Unlock className="h-2.5 w-2.5" />
                                      Aceita respostas
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-400 border-0 text-[10px] gap-1">
                                      <Lock className="h-2.5 w-2.5" />
                                      Respostas bloqueadas
                                    </Badge>
                                  )}
                                  {ann.notifyViaWhatsapp ? (
                                    <Badge variant="secondary" className="bg-green-50 text-green-600 border-0 text-[10px] gap-1">
                                      <Smartphone className="h-2.5 w-2.5" />
                                      WhatsApp
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-500 border-0 text-[10px] gap-1">
                                      <Monitor className="h-2.5 w-2.5" />
                                      Plataforma
                                    </Badge>
                                  )}
                                  {ann.creator && (
                                    <span className="text-xs text-muted-foreground">
                                      por {ann.creator.name}
                                    </span>
                                  )}
                                </div>
                                <h3 className={`text-base mb-1 group-hover:text-purple-700 transition-colors ${ann.unread ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                                  {ann.title || "Sem título"}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                  {ann.content}
                                </p>
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {ann.readAt && (
                                    <span className="flex items-center gap-1 text-emerald-600">
                                      <CheckCheck className="h-3 w-3" />
                                      Lido
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Announcement Detail / Reply Panel */}
              {selectedAnnouncement && (
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl sticky top-8">
                    <CardHeader className="border-b">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const catInfo = getCategoryInfo(selectedAnnouncement.category)
                          const CatIcon = catInfo.icon
                          return (
                            <div className={`h-10 w-10 rounded-lg ${catInfo.bg} flex items-center justify-center`}>
                              <CatIcon className={`h-5 w-5 ${catInfo.color}`} />
                            </div>
                          )
                        })()}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{selectedAnnouncement.title || "Sem título"}</CardTitle>
                          <CardDescription className="text-xs">
                            {selectedAnnouncement.creator?.name} • {new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleDateString("pt-BR")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 mb-6">
                        {selectedAnnouncement.content}
                      </p>

                      <Separator className="mb-4" />

                      <div className="space-y-3">
                        {selectedAnnouncement.allowReplies !== false ? (
                          <>
                            <p className="text-sm font-medium text-gray-700">Responder ao comunicado</p>
                            <Textarea
                              placeholder="Digite sua resposta..."
                              className="min-h-[100px] resize-none border-2 focus:border-purple-400 transition-colors"
                              value={announcementReply}
                              onChange={(e) => setAnnouncementReply(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  handleReplyToAnnouncement()
                                }
                              }}
                              disabled={isSendingAnnouncementReply}
                            />
                            <Button
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20"
                              onClick={handleReplyToAnnouncement}
                              disabled={!announcementReply.trim() || isSendingAnnouncementReply}
                            >
                              {isSendingAnnouncementReply ? (
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
                              Sua resposta criará uma conversa na aba &quot;Conversas&quot;
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-500">Respostas bloqueadas</p>
                              <p className="text-xs text-gray-400">Este comunicado não aceita respostas no momento.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================== TAB 2: CONVERSAS ==================== */}
          <TabsContent value="conversas" className="mt-6">
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
                        <div className="text-center py-12">
                          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <MessagesSquare className="h-8 w-8 text-blue-300" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Nenhuma conversa ainda</p>
                          <p className="text-xs text-muted-foreground">Responda a um comunicado para iniciar</p>
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
                              {conv.announcementId && (
                                <div className="mb-1.5">
                                  <Badge className={`text-[10px] gap-1 ${isActive ? "bg-white/20 text-white border-white/30" : "bg-purple-100 text-purple-700 border-0"}`}>
                                    <GraduationCap className="h-3 w-3" />
                                    Resposta ao comunicado
                                  </Badge>
                                </div>
                              )}
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
                                  </div>
                                </div>
                                {conv.unread && (
                                  <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className={`text-sm font-semibold mb-1 truncate ${isActive ? "text-white" : "text-gray-800"}`}>
                                {conv.subject}
                              </p>

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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                              {activeConversation.participants[0]?.name.charAt(0) || 'E'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{activeConversation.subject}</CardTitle>
                            <CardDescription className="text-xs">
                              {activeConversation.participants.map(p => p.name).join(', ')}
                            </CardDescription>
                          </div>
                        </div>
                        {activeConversation.announcementId ? (
                          <Badge className="bg-purple-100 text-purple-700 border-0 gap-1">
                            <GraduationCap className="h-3 w-3" />
                            Resposta ao comunicado
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 border-0 gap-1">
                            <MessagesSquare className="h-3 w-3" />
                            Conversa Direta
                          </Badge>
                        )}
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
                                  {!message.isFromSchool && <CheckCheck className="h-3 w-3" />}
                                </div>
                              </div>
                            </div>
                          ))}
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
                          onKeyDown={(e) => {
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
                  <Card className="border-0 shadow-xl h-[744px] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                        <MessageSquare className="h-10 w-10 text-blue-300" />
                      </div>
                      <p className="text-lg font-bold text-gray-800 mb-1">Selecione uma conversa</p>
                      <p className="text-sm text-muted-foreground">Escolha uma conversa da lista para visualizar</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
