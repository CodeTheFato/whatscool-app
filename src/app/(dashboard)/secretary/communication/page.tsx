"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Send,
  Sparkles,
  Users,
  User,
  School,
  MessageSquare,
  Clock,
  CheckCheck,
  Zap,
  DollarSign,
  AlertCircle,
  BellRing,
  Filter,
  Search,
  MessagesSquare,
  Info,
  Phone,
  X
} from "lucide-react"
import { toast } from "sonner"

// ==================== TYPES ====================
type Category = "comunicados" | "boletos" | "atraso-boletos" | "avisos"
type OriginType = "WHATSAPP" | "PLATFORM"

type Message = {
  id: string
  content: string
  from: "school" | "parent"
  timestamp: Date
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
  unread: number
  messages: Message[]
}

type ClassData = {
  id: string
  name: string
  parentCount: number
}

type StudentData = {
  id: string
  name: string
  classId: string | null
  className: string
  parents: {
    id: string
    name: string
  }[]
}

// ==================== MAIN COMPONENT ====================
export default function CommunicationPage() {
  // Tab control
  const [activeTab, setActiveTab] = useState<string>("communication")

  // ===== COMMUNICATION TAB STATES =====
  const [category, setCategory] = useState<Category>("comunicados")
  const [recipientType, setRecipientType] = useState<string>("turma")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [allowReplies, setAllowReplies] = useState<boolean>(true)

  // AI Generation
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  // ===== CHAT TAB STATES =====
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | Category>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>("")

  // Nova Mensagem Modal States
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newMsgCategory, setNewMsgCategory] = useState<Category>("comunicados")
  const [newMsgRecipientType, setNewMsgRecipientType] = useState<"turma" | "aluno">("turma")
  const [newMsgClass, setNewMsgClass] = useState<string>("")
  const [newMsgStudent, setNewMsgStudent] = useState<string>("")
  const [newMsgSubject, setNewMsgSubject] = useState<string>("")
  const [newMsgMessage, setNewMsgMessage] = useState<string>("")
  const [showNewMsgAIDialog, setShowNewMsgAIDialog] = useState(false)
  const [newMsgAIPrompt, setNewMsgAIPrompt] = useState<string>("")
  const [isGeneratingNewMsg, setIsGeneratingNewMsg] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Data from API
  const [classes, setClasses] = useState<ClassData[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

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
      const response = await fetch('/api/chat/conversations')
      if (!response.ok) {
        throw new Error('Erro ao buscar conversas')
      }
      const data = await response.json()

      // Mapeia dados da API para o formato da interface
      const mappedConversations: Conversation[] = data.map((conv: any) => {
        const lastMessage = conv.messages[0]
        const participants = conv.participants.filter((p: any) => p.user.role === 'PARENT')
        const firstParent = participants[0]?.user

        return {
          id: conv.id,
          parentName: firstParent?.name || 'Responsável',
          studentName: participants.length > 1 ? `${participants.length} responsáveis` : firstParent?.name || 'Aluno',
          subject: conv.announcement?.title || 'Conversa interna',
          category: (conv.announcement?.category?.toLowerCase() || 'comunicados') as Category,
          origin: conv.announcement ? 'WHATSAPP' : 'PLATFORM',
          status: conv.status,
          timestamp: new Date(lastMessage?.createdAt || conv.createdAt),
          unread: 0, // TODO: implementar contagem de não lidas
          messages: conv.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.body,
            from: msg.sender.role === 'PARENT' ? 'parent' : 'school',
            timestamp: new Date(msg.createdAt),
          })).reverse(),
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

  useEffect(() => {
    fetchRecipients()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchConversations()
    }
  }, [activeTab])

  // Conversas agora vêm da API via estado

  // ==================== HANDLERS ====================
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generated = `Prezados responsáveis,\n\n${aiPrompt}\n\nContamos com sua compreensão.\n\nAtenciosamente,\nEscola WhatSchool`
    setMessage(generated)
    setIsGenerating(false)
    setShowAIDialog(false)
    setAiPrompt("")

    toast.success("Mensagem gerada com sucesso!", {
      description: "A mensagem foi inserida no campo de texto."
    })
  }

  const handleSendAnnouncement = () => {
    console.log("Sending announcement:", {
      category,
      recipientType,
      recipient: recipientType === "turma" ? selectedClass : selectedStudent,
      subject,
      message,
      allowReplies,
    })

    toast.success("Comunicado enviado!", {
      description: allowReplies
        ? "Mensagem enviada via WhatsApp. Chat criado para respostas."
        : "Mensagem enviada via WhatsApp."
    })

    // Reset form
    setSubject("")
    setMessage("")
    setSelectedClass("")
    setSelectedStudent("")
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return

    console.log("Sending reply:", replyText)
    toast.success("Resposta enviada!")
    setReplyText("")
  }

  const handleGenerateNewMsgWithAI = async () => {
    if (!newMsgAIPrompt.trim()) return

    setIsGeneratingNewMsg(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generated = `Prezados responsáveis,\n\n${newMsgAIPrompt}\n\nContamos com sua compreensão.\n\nAtenciosamente,\nEscola WhatSchool`
    setNewMsgMessage(generated)
    setIsGeneratingNewMsg(false)
    setShowNewMsgAIDialog(false)
    setNewMsgAIPrompt("")

    toast.success("Mensagem gerada com sucesso!", {
      description: "A mensagem foi inserida no campo de texto."
    })
  }

  const handleCreateConversation = async () => {
    if (!newMsgMessage.trim()) {
      toast.error("A mensagem é obrigatória")
      return
    }

    if (newMsgRecipientType === "turma" && !newMsgClass) {
      toast.error("Selecione uma turma")
      return
    }

    if (newMsgRecipientType === "aluno" && !newMsgStudent) {
      toast.error("Selecione um aluno")
      return
    }

    // Mapeia tipo em português para inglês
    const audienceTypeMap = {
      turma: "CLASS",
      aluno: "STUDENT"
    }

    const payload = {
      audienceType: audienceTypeMap[newMsgRecipientType],
      classId: newMsgRecipientType === "turma" ? newMsgClass : undefined,
      studentId: newMsgRecipientType === "aluno" ? newMsgStudent : undefined,
      message: newMsgMessage,
      subject: newMsgSubject || undefined,
    }

    setIsCreatingConversation(true)

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar conversa")
      }

      const data = await response.json()

      toast.success("Conversa criada com sucesso!", {
        description: `Conversa iniciada com ${data.recipientCount} destinatário(s).`
      })

      // Reset modal
      setShowNewMessageModal(false)
      setNewMsgCategory("comunicados")
      setNewMsgRecipientType("turma")
      setNewMsgClass("")
      setNewMsgStudent("")
      setNewMsgSubject("")
      setNewMsgMessage("")

      // Recarregar lista de conversas
      await fetchConversations()

      // Navegar para a conversa criada
      setSelectedConversation(data.conversationId)
      setActiveTab("chat")
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar conversa")
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const getRecipientCount = () => {
    if (recipientType === "turma" && selectedClass) return "342 responsáveis"
    if (recipientType === "aluno" && selectedStudent) return "1 responsável"
    return "0 destinatários"
  }

  const getMessagePreview = () => {
    if (!message) return "Sua mensagem aparecerá aqui..."

    const footer = allowReplies
      ? "\n\nPara responder, acesse o WhatSchool - Central de Comunicação."
      : ""

    return message + footer
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter =
      chatFilter === "all" ? true :
        chatFilter === "unread" ? conv.unread > 0 :
          conv.category === chatFilter

    const matchesSearch =
      conv.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const activeConversation = conversations.find((c) => c.id === selectedConversation)

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessagesSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Central de Comunicação
              </h1>
              <p className="text-sm text-muted-foreground">
                Envie notificações via WhatsApp e gerencie conversas na plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enviadas Hoje</p>
                  <p className="text-3xl font-bold text-green-600">12</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversas Ativas</p>
                  <p className="text-3xl font-bold text-blue-600">8</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessagesSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                  <p className="text-3xl font-bold text-purple-600">3</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
            <TabsTrigger
              value="communication"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Zap className="h-4 w-4" />
              Comunicação
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <MessagesSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: COMMUNICATION ==================== */}
          <TabsContent value="communication" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Left: Form */}
              <div className="lg:col-span-3 space-y-6">

                {/* Info Banner */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-900">
                          WhatsApp é canal de notificação
                        </p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Mensagens enviadas via WhatsApp são notificações. Respostas acontecem exclusivamente na plataforma.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Selection */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <BellRing className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Categoria</CardTitle>
                        <CardDescription>Classifique o tipo de comunicação</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => {
                          const Icon = cat.icon
                          return (
                            <SelectItem key={cat.id} value={cat.id} className="h-12">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg ${cat.bg} flex items-center justify-center`}>
                                  <Icon className={`h-4 w-4 ${cat.color}`} />
                                </div>
                                <span className="font-medium">{cat.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Recipients */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Destinatários</CardTitle>
                        <CardDescription>Selecione quem receberá a notificação</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <Label>Tipo de Destinatário</Label>
                      <Select value={recipientType} onValueChange={setRecipientType}>
                        <SelectTrigger className="h-12 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="turma" className="h-12">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium">Turma Inteira</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="aluno" className="h-12">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-medium">Aluno Individual</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {recipientType === "turma" && (
                      <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        <Label>Selecionar Turma</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                          <SelectTrigger className="h-12 border-2">
                            <SelectValue placeholder="Escolha uma turma" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {recipientType === "aluno" && (
                      <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        <Label>Selecionar Aluno</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                          <SelectTrigger className="h-12 border-2">
                            <SelectValue placeholder="Escolha um aluno" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <div>
                                  <div className="font-medium">{s.name}</div>
                                  <div className="text-xs text-muted-foreground">{s.className}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Destinatários</span>
                        <Badge className="bg-blue-600 text-white">
                          {getRecipientCount()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Message */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Mensagem</CardTitle>
                          <CardDescription>Escreva o conteúdo da notificação</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAIDialog(true)}
                        className="gap-2 border-purple-200 hover:bg-purple-50"
                      >
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Gerar com IA
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <Label className="flex items-center justify-between">
                        <span>Texto da Mensagem</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {message.length} / 1000 caracteres
                        </span>
                      </Label>
                      <Textarea
                        placeholder="Digite sua mensagem..."
                        className="min-h-[200px] resize-none border-2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={1000}
                      />
                    </div>

                    <div className="pt-4 border-t space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Permitir respostas na plataforma</Label>
                          <p className="text-xs text-muted-foreground">
                            Cria chat interno para conversas bidirecionais
                          </p>
                        </div>
                        <Switch
                          checked={allowReplies}
                          onCheckedChange={setAllowReplies}
                        />
                      </div>

                      <Button
                        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                        onClick={handleSendAnnouncement}
                        disabled={!message || (!selectedClass && !selectedStudent)}
                      >
                        <Send className="mr-2 h-5 w-5" />
                        Enviar via WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Preview */}
              <div className="lg:col-span-2">
                <Card className="sticky top-6 border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Preview WhatsApp</CardTitle>
                        <CardDescription>Como ficará no celular</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-[#e5ddd5] p-6 min-h-[300px]">
                      <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-md max-w-[85%]">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {getMessagePreview()}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-3">
                          <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <CheckCheck className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">Entrega via WhatsApp Business</span>
                        </div>
                        {allowReplies && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MessagesSquare className="h-3 w-3" />
                            <span>Chat interno será criado para respostas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Dialog */}
            {showAIDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>Gerar Mensagem com IA</CardTitle>
                          <CardDescription>Descreva o que deseja comunicar</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAIDialog(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Ex: Informar sobre reunião de pais na próxima sexta-feira às 18h..."
                      className="min-h-[150px] resize-none border-2"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowAIDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                        onClick={handleGenerateWithAI}
                        disabled={!aiPrompt.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gerar Mensagem
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 2: CHAT ==================== */}
          <TabsContent value="chat" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

              {/* Conversations List */}
              <div className="lg:col-span-3">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessagesSquare className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Conversas</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowNewMessageModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Nova Mensagem
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar conversas..."
                          className="pl-10 border-2"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant={chatFilter === "all" ? "default" : "outline"}
                          onClick={() => setChatFilter("all")}
                        >
                          Todas
                        </Button>
                        <Button
                          size="sm"
                          variant={chatFilter === "unread" ? "default" : "outline"}
                          onClick={() => setChatFilter("unread")}
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
                          <p className="text-sm">Carregando conversas...</p>
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <MessagesSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">Nenhuma conversa encontrada</p>
                        </div>
                      ) : (
                        filteredConversations.map((conv) => {
                          const categoryData = categories.find((c) => c.id === conv.category)
                          const Icon = categoryData?.icon || MessageSquare
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
                                  {conv.origin === "WHATSAPP" ? (
                                    <Badge className="bg-green-100 text-green-700 border-0 text-[10px] gap-1">
                                      <Zap className="h-3 w-3" />
                                      WhatsApp
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] gap-1">
                                      <MessagesSquare className="h-3 w-3" />
                                      Plataforma
                                    </Badge>
                                  )}
                                  {conv.unread > 0 && (
                                    <Badge className="bg-red-500 text-white border-0 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                      {conv.unread}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm font-semibold mb-1 truncate ${isActive ? "text-white" : "text-gray-800"}`}>
                                {conv.subject}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className={`text-xs truncate flex-1 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                                  {conv.messages[conv.messages.length - 1]?.content.slice(0, 50)}...
                                </p>
                                <span className={`text-[10px] ml-2 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                                  {conv.timestamp.toLocaleDateString("pt-BR")}
                                </span>
                              </div>
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
                {selectedConversation && activeConversation ? (
                  <Card className="border-0 shadow-xl h-[744px] flex flex-col">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                              {activeConversation.parentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{activeConversation.subject}</CardTitle>
                            <CardDescription className="text-xs">
                              {activeConversation.parentName} • {activeConversation.studentName}
                            </CardDescription>
                          </div>
                        </div>
                        {activeConversation.origin === "WHATSAPP" ? (
                          <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                            <Zap className="h-3 w-3" />
                            Origem: WhatsApp
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 border-0 gap-1">
                            <MessagesSquare className="h-3 w-3" />
                            Iniciado na plataforma
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-4">
                        {activeConversation.messages.map((msg) => (
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
                      </div>
                    </ScrollArea>

                    <Separator />
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50">
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
                        />
                        <Button
                          size="icon"
                          className="h-[60px] w-[60px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={handleSendReply}
                          disabled={!replyText.trim()}
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <MessagesSquare className="h-3 w-3" />
                        Resposta será enviada via plataforma
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-xl h-[744px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessagesSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-semibold mb-2">Nenhuma conversa selecionada</p>
                      <p className="text-sm">Selecione uma conversa para visualizar e responder</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Nova Mensagem Modal */}
            {showNewMessageModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>Nova Mensagem Interna</CardTitle>
                          <CardDescription>Iniciar conversa na plataforma (sem WhatsApp)</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNewMessageModal(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-5">
                      {/* Info Banner */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Conversa exclusivamente interna</p>
                          <p className="text-blue-700">Esta mensagem será enviada apenas pela plataforma. Não haverá notificação via WhatsApp.</p>
                        </div>
                      </div>

                      {/* Categoria */}
                      <div>
                        <Label htmlFor="newMsgCategory">Categoria (opcional)</Label>
                        <Select value={newMsgCategory} onValueChange={(val) => setNewMsgCategory(val as Category)}>
                          <SelectTrigger className="mt-1.5 border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => {
                              const Icon = cat.icon
                              return (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${cat.color}`} />
                                    <span>{cat.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tipo de Destinatário */}
                      <div>
                        <Label>Tipo de Destinatário</Label>
                        <div className="grid grid-cols-2 gap-3 mt-1.5">
                          <button
                            onClick={() => setNewMsgRecipientType("turma")}
                            className={`p-4 rounded-xl border-2 transition-all ${newMsgRecipientType === "turma"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <School className={`h-5 w-5 mx-auto mb-2 ${newMsgRecipientType === "turma" ? "text-blue-600" : "text-gray-400"}`} />
                            <span className={`text-sm font-medium ${newMsgRecipientType === "turma" ? "text-blue-900" : "text-gray-600"}`}>
                              Turma Inteira
                            </span>
                          </button>
                          <button
                            onClick={() => setNewMsgRecipientType("aluno")}
                            className={`p-4 rounded-xl border-2 transition-all ${newMsgRecipientType === "aluno"
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <User className={`h-5 w-5 mx-auto mb-2 ${newMsgRecipientType === "aluno" ? "text-purple-600" : "text-gray-400"}`} />
                            <span className={`text-sm font-medium ${newMsgRecipientType === "aluno" ? "text-purple-900" : "text-gray-600"}`}>
                              Aluno Específico
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Selecionar Turma */}
                      {newMsgRecipientType === "turma" && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="newMsgClass">Selecionar Turma</Label>
                            <Select value={newMsgClass} onValueChange={setNewMsgClass} disabled={isLoadingRecipients}>
                              <SelectTrigger className="mt-1.5 border-2">
                                <SelectValue placeholder={isLoadingRecipients ? "Carregando..." : "Escolha uma turma"} />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.length === 0 ? (
                                  <div className="p-2 text-sm text-muted-foreground text-center">
                                    Nenhuma turma encontrada
                                  </div>
                                ) : (
                                  classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                      {cls.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Indicador de Responsáveis */}
                          {newMsgClass && (() => {
                            const selectedClass = classes.find(c => c.id === newMsgClass)
                            if (!selectedClass) return null
                            const parentCount = selectedClass.parentCount
                            return (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {parentCount} {parentCount === 1 ? 'responsável selecionado' : 'responsáveis selecionados'}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {/* Selecionar Aluno */}
                      {newMsgRecipientType === "aluno" && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="newMsgStudent">Selecionar Aluno</Label>
                            <Select value={newMsgStudent} onValueChange={setNewMsgStudent} disabled={isLoadingRecipients}>
                              <SelectTrigger className="mt-1.5 border-2">
                                <SelectValue placeholder={isLoadingRecipients ? "Carregando..." : "Escolha um aluno"} />
                              </SelectTrigger>
                              <SelectContent>
                                {students.length === 0 ? (
                                  <div className="p-2 text-sm text-muted-foreground text-center">
                                    Nenhum aluno encontrado
                                  </div>
                                ) : (
                                  students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                      {student.name} ({student.className})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Indicador de Responsáveis */}
                          {newMsgStudent && (() => {
                            const selectedStudent = students.find(s => s.id === newMsgStudent)
                            if (!selectedStudent) return null
                            const parentCount = selectedStudent.parents.length
                            return (
                              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-900">
                                    {parentCount} {parentCount === 1 ? 'responsável selecionado' : 'responsáveis selecionados'}
                                  </span>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="text-xs text-purple-600 hover:text-purple-800 underline">
                                        Ver nomes
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        {selectedStudent.parents.map((parent) => (
                                          <p key={parent.id} className="text-sm">{parent.name}</p>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {/* Assunto */}
                      <div>
                        <Label htmlFor="newMsgSubject">Assunto (opcional)</Label>
                        <Input
                          id="newMsgSubject"
                          placeholder="Ex: Dúvida sobre atividade"
                          className="mt-1.5 border-2"
                          value={newMsgSubject}
                          onChange={(e) => setNewMsgSubject(e.target.value)}
                        />
                      </div>

                      {/* Mensagem */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label htmlFor="newMsgMessage">Mensagem *</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowNewMsgAIDialog(true)}
                            className="gap-2"
                          >
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            Gerar com IA
                          </Button>
                        </div>
                        <Textarea
                          id="newMsgMessage"
                          placeholder="Digite sua mensagem..."
                          className="min-h-[120px] border-2"
                          value={newMsgMessage}
                          onChange={(e) => setNewMsgMessage(e.target.value)}
                          maxLength={1000}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-xs text-muted-foreground">
                            Máximo 1000 caracteres
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {newMsgMessage.length}/1000
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowNewMessageModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={handleCreateConversation}
                          disabled={!newMsgMessage.trim() || isCreatingConversation}
                        >
                          {isCreatingConversation ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Criando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Criar Conversa
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Dialog for Nova Mensagem */}
            {showNewMsgAIDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>Gerar Mensagem com IA</CardTitle>
                          <CardDescription>Descreva o que deseja comunicar</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNewMsgAIDialog(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newMsgAIPrompt">O que você quer comunicar?</Label>
                        <Textarea
                          id="newMsgAIPrompt"
                          placeholder="Ex: Informar sobre mudança de horário da aula de matemática na próxima semana"
                          className="mt-1.5 min-h-[100px] border-2"
                          value={newMsgAIPrompt}
                          onChange={(e) => setNewMsgAIPrompt(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowNewMsgAIDialog(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          onClick={handleGenerateNewMsgWithAI}
                          disabled={!newMsgAIPrompt.trim() || isGeneratingNewMsg}
                        >
                          {isGeneratingNewMsg ? (
                            <>
                              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Gerar Mensagem
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
