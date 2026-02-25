"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Users,
  User,
  MessageSquare,
  Clock,
  CheckCheck,
  DollarSign,
  AlertCircle,
  BellRing,
  Search,
  MessagesSquare,
  Plus,
  Megaphone,
  Lock,
  Unlock,
  GraduationCap,
  Smartphone,
  Monitor,
} from "lucide-react"
import { toast } from "sonner"
import NewCommunicationModal from "@/components/secretary/NewCommunicationModal"
import type { ClassData, StudentData } from "@/components/secretary/NewCommunicationModal"

// ==================== TYPES ====================
type Category = "comunicados" | "boletos" | "atraso-boletos" | "avisos"
type OriginType = "WHATSAPP" | "PLATFORM"

type Message = {
  id: string
  content: string
  from: "school" | "parent"
  timestamp: Date
  senderName: string
}

type Conversation = {
  id: string
  parentName: string
  studentName: string
  subject: string
  category: Category
  origin: OriginType
  status: "OPEN" | "CLOSED"
  timestamp: Date
  unread: boolean
  messages: Message[]
  announcementId?: string | null
}

type AnnouncementItem = {
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
  totalRecipients: number
  totalConversations: number
  allowReplies?: boolean
  notifyViaWhatsapp?: boolean
}

// ==================== HELPERS ====================
/** Frontend category (hyphen) → Prisma enum (UPPER_SNAKE) */
const categoryToEnum = (cat: Category): string => cat.toUpperCase().replace(/-/g, '_')
/** Prisma enum (UPPER_SNAKE) → frontend category (hyphen) */
const enumToCategory = (val: string): Category => val.toLowerCase().replace(/_/g, '-') as Category

// ==================== MAIN COMPONENT ====================
export default function CommunicationPage() {
  // Tab control
  const [activeTab, setActiveTab] = useState<string>("comunicados")

  // ===== CHAT TAB STATES =====
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [activeConversationFull, setActiveConversationFull] = useState<Conversation | null>(null)
  const [isLoadingActiveConversation, setIsLoadingActiveConversation] = useState(false)
  const [replyText, setReplyText] = useState<string>("")
  const [isSendingReply, setIsSendingReply] = useState(false)

  // Badges
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0)

  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Nova Comunicação Modal (unificada)
  const [showComposerModal, setShowComposerModal] = useState(false)

  // Data from API
  const [classes, setClasses] = useState<ClassData[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // Announcements feed
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)

  const categories = [
    { id: "comunicados" as const, label: "Comunicados", icon: BellRing, color: "text-purple-600", bg: "bg-purple-50" },
    { id: "boletos" as const, label: "Boletos", icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
    { id: "atraso-boletos" as const, label: "Atraso de Boletos", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { id: "avisos" as const, label: "Avisos Gerais", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  ]

  // ==================== DATA FETCHING ====================
  const fetchRecipients = async () => {
    setIsLoadingRecipients(true)
    try {
      const response = await fetch('/api/chat/recipients')
      if (!response.ok) {
        throw new Error('Erro ao buscar destinatários')
      }
      const data = await response.json()
      console.log("Recipients data:", data)
      setClasses(data.classes || [])
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching recipients:', error)
      toast.error('Erro ao carregar turmas e alunos')
    } finally {
      setIsLoadingRecipients(false)
    }
  }

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const params = new URLSearchParams()
      if (unreadOnly) {
        params.set('unread', 'true')
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`/api/chat/conversations?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar conversas')
      }
      const data = await response.json()

      const mappedConversations: Conversation[] = data.map((conv: any) => {
        const lastMessage = conv.messages[0]
        const participants = conv.participants.filter((p: any) => p.user.role === 'PARENT')
        const firstParent = participants[0]?.user

        let studentName = 'Aluno'
        if (firstParent?.parent?.students && firstParent.parent.students.length > 0) {
          studentName = firstParent.parent.students[0].user.name
        }

        return {
          id: conv.id,
          parentName: firstParent?.name || 'Responsável',
          studentName: studentName,
          subject: conv.announcement?.title || conv.subject || 'Conversa interna',
          category: conv.announcement?.category ? enumToCategory(conv.announcement.category) : 'comunicados',
          origin: conv.announcementId ? 'WHATSAPP' : 'PLATFORM',
          status: conv.status,
          timestamp: new Date(lastMessage?.createdAt || conv.createdAt),
          unread: conv.unread || false,
          messages: conv.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.body,
            from: msg.sender.role === 'PARENT' ? 'parent' : 'school',
            timestamp: new Date(msg.createdAt),
          })).reverse(),
          announcementId: conv.announcementId || null,
        }
      })

      setConversations(mappedConversations)
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/chat/conversations/badges')
      if (!response.ok) {
        throw new Error('Erro ao buscar badges')
      }
      const data = await response.json()
      setChatUnreadCount(data.chatUnreadCount || 0)
      setAnnouncementUnreadCount(data.announcementUnreadCount || 0)
    } catch (error) {
      console.error('Erro ao buscar badges:', error)
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

  // Busca conversa completa com todas as mensagens
  const fetchFullConversation = async (conversationId: string) => {
    setIsLoadingActiveConversation(true)
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar conversa')
      }
      const data = await response.json()

      const participants = data.participants.filter((p: any) => p.user.role === 'PARENT')
      const firstParent = participants[0]?.user

      let studentName = 'Aluno'
      if (firstParent?.parent?.students && firstParent.parent.students.length > 0) {
        studentName = firstParent.parent.students[0].user.name
      }

      const fullConv: Conversation = {
        id: data.id,
        parentName: firstParent?.name || 'Responsável',
        studentName: studentName,
        subject: data.announcement?.title || data.subject || 'Conversa interna',
        category: data.announcement?.category ? enumToCategory(data.announcement.category) : 'comunicados',
        origin: data.announcementId ? 'WHATSAPP' : 'PLATFORM',
        status: data.status,
        timestamp: new Date(data.createdAt),
        unread: false,
        messages: data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.body,
          from: msg.sender.role === 'PARENT' ? 'parent' : 'school',
          timestamp: new Date(msg.createdAt),
          senderName: msg.sender.name,
        })),
        announcementId: data.announcementId || null,
      }

      setActiveConversationFull(fullConv)
    } catch (error) {
      console.error('Erro ao buscar conversa completa:', error)
      toast.error('Erro ao carregar conversa')
    } finally {
      setIsLoadingActiveConversation(false)
    }
  }

  // Polling para novas mensagens
  const pollForNewMessages = async (conversationId: string) => {
    if (!activeConversationFull) return

    const lastMessageId = activeConversationFull.messages[activeConversationFull.messages.length - 1]?.id
    if (!lastMessageId) return

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/poll?lastMessageId=${lastMessageId}`)
      if (!response.ok) return

      const data = await response.json()

      if (data.hasNewMessages && data.messages.length > 0) {
        setActiveConversationFull(prev => {
          if (!prev) return null

          const existingIds = new Set(prev.messages.map(m => m.id))
          const newMessages = data.messages
            .filter((msg: any) => !existingIds.has(msg.id))
            .map((msg: any) => ({
              id: msg.id,
              content: msg.body,
              from: msg.sender.role === 'PARENT' ? 'parent' : 'school',
              timestamp: new Date(msg.createdAt),
              senderName: msg.sender.name,
            }))

          if (newMessages.length === 0) return prev

          return {
            ...prev,
            messages: [...prev.messages, ...newMessages]
          }
        })

        await fetchBadges()
      }
    } catch (error) {
      console.error('Erro no polling:', error)
    }
  }

  useEffect(() => {
    fetchRecipients()
    fetchBadges()
    fetchAnnouncements()
  }, [])

  // Refetch conversations quando mudar filtro ou busca
  useEffect(() => {
    if (activeTab === 'conversas') {
      fetchConversations()
    }
  }, [unreadOnly, searchQuery, activeTab])

  // Busca conversa completa quando selecionada
  useEffect(() => {
    if (selectedConversation) {
      fetchFullConversation(selectedConversation)
    } else {
      setActiveConversationFull(null)
    }
  }, [selectedConversation])

  // Polling para novas mensagens na conversa ativa
  useEffect(() => {
    if (!selectedConversation || !activeConversationFull) return

    const interval = setInterval(() => {
      pollForNewMessages(selectedConversation)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedConversation, activeConversationFull])

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (activeConversationFull?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeConversationFull?.messages])

  const refreshAfterAction = async () => {
    await fetchConversations()
    await fetchBadges()
  }

  // ==================== HANDLERS ====================
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !activeConversationFull) return

    setIsSendingReply(true)
    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText.trim() })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao enviar mensagem')
      }

      const newMessage = await response.json()

      setActiveConversationFull(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, {
            id: newMessage.id,
            content: newMessage.body,
            from: 'school' as const,
            timestamp: new Date(newMessage.createdAt),
            senderName: newMessage.sender.name
          }]
        }
      })

      setReplyText("")
      toast.success("Resposta enviada!")

      await refreshAfterAction()
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar resposta')
    } finally {
      setIsSendingReply(false)
    }
  }

  // ==================== RENDER HELPERS ====================
  const getCategoryInfo = (enumVal: string) => {
    const cat = enumToCategory(enumVal)
    return categories.find(c => c.id === cat) || categories[0]
  }

  const getAudienceLabel = (ann: AnnouncementItem) => {
    if (ann.audienceType === 'CLASS' && ann.class) return ann.class.name
    if (ann.audienceType === 'STUDENT' && ann.student) return ann.student.user.name
    if (ann.audienceType === 'ALL_SCHOOL') return 'Toda a escola'
    return ''
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessagesSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Comunicação
              </h1>
              <p className="text-sm text-muted-foreground">
                Envie comunicados e gerencie conversas com responsáveis
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowComposerModal(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Nova Comunicação
            </Button>
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
              {announcementUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-1">
                  {announcementUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="conversas"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <MessagesSquare className="h-4 w-4" />
              Conversas
              {chatUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-1">
                  {chatUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: COMUNICADOS (Feed) ==================== */}
          <TabsContent value="comunicados" className="mt-6">
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
                    <p className="text-xl font-bold text-gray-800 mb-2">Nenhum comunicado enviado ainda</p>
                    <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Envie seu primeiro comunicado para os responsáveis da escola. É rápido e simples.</p>
                    <Button
                      onClick={() => setShowComposerModal(true)}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 px-6"
                    >
                      <Plus className="h-4 w-4" />
                      Criar Comunicado
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                announcements.map((ann) => {
                  const catInfo = getCategoryInfo(ann.category)
                  const CatIcon = catInfo.icon
                  return (
                    <Card key={ann.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-default">
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
                              {ann.allowReplies !== false ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-[10px] gap-1 font-medium">
                                  <Unlock className="h-3 w-3" />
                                  Respostas abertas
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0 text-[10px] gap-1 font-medium">
                                  <Lock className="h-3 w-3" />
                                  Respostas bloqueadas
                                </Badge>
                              )}
                              {ann.totalConversations > 0 && (
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-0 text-[10px] gap-1 font-medium">
                                  <MessageSquare className="h-3 w-3" />
                                  {ann.totalConversations} {ann.totalConversations === 1 ? "responsável respondeu" : "responsáveis responderam"}
                                </Badge>
                              )}
                              {ann.notifyViaWhatsapp ? (
                                <Badge variant="secondary" className="bg-green-50 text-green-700 border-0 text-[10px] gap-1 font-medium">
                                  <Smartphone className="h-3 w-3" />
                                  WhatsApp
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-500 border-0 text-[10px] gap-1 font-medium">
                                  <Monitor className="h-3 w-3" />
                                  Plataforma
                                </Badge>
                              )}
                              {getAudienceLabel(ann) && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {getAudienceLabel(ann)}
                                </span>
                              )}
                              {ann.creator && (
                                <span className="text-xs text-muted-foreground">
                                  por {ann.creator.name}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                              {ann.title || "Sem título"}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {ann.content}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-5 mt-3 pt-3 border-t text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {ann.totalRecipients} destinatário{ann.totalRecipients !== 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Send className="h-3.5 w-3.5" />
                                {ann.totalRecipients} enviado{ann.totalRecipients !== 1 ? "s" : ""}
                              </span>
                              <span className={`flex items-center gap-1.5 ${ann.totalConversations > 0 ? "text-purple-600 font-semibold" : ""}`}>
                                <MessageSquare className="h-3.5 w-3.5" />
                                {ann.totalConversations} resposta{ann.totalConversations !== 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1.5 ml-auto">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
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
                      {chatUnreadCount > 0 && (
                        <Badge className="bg-red-500 text-white border-0">
                          {chatUnreadCount} não lida{chatUnreadCount !== 1 ? "s" : ""}
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
                        <div className="text-center py-12 px-4">
                          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <MessagesSquare className="h-8 w-8 text-blue-300" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Nenhuma conversa ainda</p>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                            Conversas aparecerão quando responsáveis responderem a um comunicado, ou quando você iniciar uma conversa direta.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-4 gap-1.5 text-xs"
                            onClick={() => setShowComposerModal(true)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Nova conversa
                          </Button>
                        </div>
                      ) : (
                        conversations.map((conv) => {
                          const isActive = selectedConversation === conv.id

                          return (
                            <button
                              key={conv.id}
                              onClick={() => setSelectedConversation(conv.id)}
                              className={`w-full p-4 rounded-xl text-left transition-all ${isActive
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                : "bg-white hover:bg-gray-50 border-2"
                                }`}
                            >
                              <div className="mb-1.5">
                                {conv.announcementId ? (
                                  <Badge className={`text-[10px] gap-1 ${isActive ? "bg-white/20 text-white border-white/30" : "bg-purple-100 text-purple-700 border-0"}`}>
                                    <GraduationCap className="h-3 w-3" />
                                    Resposta ao comunicado
                                  </Badge>
                                ) : (
                                  <Badge className={`text-[10px] gap-1 ${isActive ? "bg-white/20 text-white border-white/30" : "bg-blue-100 text-blue-700 border-0"}`}>
                                    <MessageSquare className="h-3 w-3" />
                                    Conversa direta
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className={isActive ? "bg-white/20 text-white" : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"}>
                                      {conv.parentName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
                                      {conv.parentName}
                                    </p>
                                    <p className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                                      {conv.studentName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {conv.unread && (
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm font-semibold mb-1 truncate ${isActive ? "text-white" : "text-gray-800"}`}>
                                {conv.subject}
                              </p>

                              {conv.messages && conv.messages.length > 0 && (
                                <div className="flex items-center justify-between mt-1">
                                  <p className={`text-xs truncate flex-1 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                                    {conv.messages[conv.messages.length - 1]?.content.slice(0, 50)}...
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
                {selectedConversation && activeConversationFull ? (
                  <Card className="border-0 shadow-xl h-[850px] flex flex-col overflow-hidden">
                    <CardHeader className="border-b flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                              {activeConversationFull.parentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{activeConversationFull.subject}</CardTitle>
                            <CardDescription className="text-xs">
                              {activeConversationFull.parentName} • {activeConversationFull.studentName}
                            </CardDescription>
                          </div>
                        </div>
                        {activeConversationFull.announcementId ? (
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

                    <ScrollArea className="h-[650px] p-6">
                      {isLoadingActiveConversation ? (
                        <div className="text-center py-12">
                          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeConversationFull.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.from === "school" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${msg.from === "school"
                                  ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                                  : "bg-white border-2 border-gray-100 rounded-tl-sm"
                                  }`}
                              >
                                {msg.from === "parent" && (
                                  <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                    {msg.senderName}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {msg.content}
                                </p>
                                <div
                                  className={`flex items-center justify-end gap-1 text-[10px] mt-2 ${msg.from === "school" ? "text-white/70" : "text-gray-500"
                                    }`}
                                >
                                  <span>
                                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {msg.from === "school" && <CheckCheck className="h-3 w-3" />}
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
                          placeholder="Digite sua resposta..."
                          className="flex-1 min-h-[60px] max-h-[120px] resize-none border-2"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendReply()
                            }
                          }}
                          disabled={isSendingReply}
                        />
                        <Button
                          size="icon"
                          className="h-[60px] w-[60px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || isSendingReply}
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-xl h-[850px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessagesSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-semibold mb-2">Nenhuma conversa selecionada</p>
                      <p className="text-sm">Selecione uma conversa para visualizar e responder</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ==================== MODAL: Novo Comunicado ==================== */}
        <NewCommunicationModal
          open={showComposerModal}
          onClose={() => setShowComposerModal(false)}
          classes={classes}
          students={students}
          isLoadingRecipients={isLoadingRecipients}
          onSendAnnouncement={async (payload) => {
            const response = await fetch("/api/announcements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
            if (!response.ok) {
              const err = await response.json()
              throw new Error(err.error || "Erro ao enviar comunicado")
            }
            const data = await response.json()
            const count = data.stats?.recipientsCount ?? data.recipientCount ?? 0
            const providers = data.stats?.providers ?? ["PLATFORM"]
            toast.success("Comunicado publicado!", {
              description: `${count} destinatário(s) notificados via ${providers.join(" + ")}.${payload.allowReplies ? " Conversas serão criadas quando responderem." : ""}`,
            })
            setShowComposerModal(false)
            await fetchBadges()
            await fetchAnnouncements()
          }}
          onCreateConversation={async (payload) => {
            const response = await fetch("/api/chat/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
            if (!response.ok) {
              const err = await response.json()
              throw new Error(err.error || "Erro ao criar conversa")
            }
            toast.success("Conversa iniciada!", {
              description: "A conversa aparecerá na aba Conversas.",
            })
            setShowComposerModal(false)
            setActiveTab("conversas")
            await fetchConversations()
            await fetchBadges()
          }}
        />
      </div>
    </div>
  )
}
