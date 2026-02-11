"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Filter,
  CheckCheck,
  Clock,
  FileText,
  DollarSign,
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  X
} from "lucide-react"

type Category = "all" | "conteudo" | "comunicados" | "autorizacao" | "boleto"

interface Message {
  id: string
  from: "school" | "parent"
  content: string
  timestamp: Date
  read: boolean
  attachments?: { type: "image" | "file"; url: string; name: string }[]
}

interface Thread {
  id: string
  category: Category
  subject: string
  lastMessage: string
  timestamp: Date
  unread: number
  messages: Message[]
}

export default function ParentMessagesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyText, setReplyText] = useState("")

  // Mock data
  const threads: Thread[] = [
    {
      id: "1",
      category: "conteudo",
      subject: "Conteúdo do Dia - Matemática",
      lastMessage: "Hoje trabalhamosfrações e números decimais...",
      timestamp: new Date(2026, 1, 10, 14, 30),
      unread: 0,
      messages: [
        {
          id: "1",
          from: "school",
          content: "Olá! Hoje trabalhamos frações e números decimais. Por favor, ajude seu filho a revisar os exercícios da página 45.",
          timestamp: new Date(2026, 1, 10, 14, 30),
          read: true,
        },
      ],
    },
    {
      id: "2",
      category: "comunicados",
      subject: "Reunião de Pais - Próxima Sexta",
      lastMessage: "Informamos que haverá reunião de pais...",
      timestamp: new Date(2026, 1, 9, 9, 15),
      unread: 1,
      messages: [
        {
          id: "1",
          from: "school",
          content: "Prezados responsáveis,\n\nInformamos que haverá reunião de pais na próxima sexta-feira, dia 14/02, às 18h.\n\nPor favor, confirme sua presença.\n\nAtenciosamente,\nSecretaria",
          timestamp: new Date(2026, 1, 9, 9, 15),
          read: true,
        },
      ],
    },
    {
      id: "3",
      category: "autorizacao",
      subject: "Autorização - Passeio ao Museu",
      lastMessage: "Você respondeu: Autorizo a participação...",
      timestamp: new Date(2026, 1, 8, 16, 45),
      unread: 0,
      messages: [
        {
          id: "1",
          from: "school",
          content: "Solicitamos autorização para que seu filho participe do passeio ao Museu de Ciências no dia 20/02.\n\nFavor responder até o dia 12/02.",
          timestamp: new Date(2026, 1, 8, 10, 0),
          read: true,
        },
        {
          id: "2",
          from: "parent",
          content: "Autorizo a participação do meu filho no passeio.",
          timestamp: new Date(2026, 1, 8, 16, 45),
          read: true,
        },
      ],
    },
    {
      id: "4",
      category: "boleto",
      subject: "Boleto - Mensalidade Fevereiro/2026",
      lastMessage: "Segue em anexo o boleto da mensalidade...",
      timestamp: new Date(2026, 1, 5, 8, 0),
      unread: 0,
      messages: [
        {
          id: "1",
          from: "school",
          content: "Segue em anexo o boleto da mensalidade de Fevereiro/2026.\n\nVencimento: 15/02/2026\nValor: R$ 850,00",
          timestamp: new Date(2026, 1, 5, 8, 0),
          read: true,
          attachments: [
            { type: "file", url: "#", name: "boleto_fev_2026.pdf" },
          ],
        },
      ],
    },
  ]

  const categories = [
    { id: "all" as Category, label: "Todas", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { id: "conteudo" as Category, label: "Conteúdo do Dia", icon: FileText, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { id: "comunicados" as Category, label: "Comunicados", icon: AlertCircle, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
    { id: "autorizacao" as Category, label: "Autorizações", icon: CheckCheck, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { id: "boleto" as Category, label: "Boletos", icon: DollarSign, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  ]

  const filteredThreads = threads.filter((thread) => {
    const matchesCategory = selectedCategory === "all" || thread.category === selectedCategory
    const matchesSearch = thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const activeThread = threads.find((t) => t.id === selectedThread)

  const handleSendReply = () => {
    if (!replyText.trim()) return
    // Aqui você implementaria o envio real da mensagem
    console.log("Enviando resposta:", replyText)
    setReplyText("")
  }

  const getCategoryInfo = (category: Category) => {
    return categories.find((c) => c.id === category) || categories[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mensagens e Comunicados
              </h1>
              <p className="text-sm text-muted-foreground">
                Central de comunicação com a escola
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Mensagens</p>
                  <p className="text-3xl font-bold text-blue-600">{threads.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {threads.reduce((acc, t) => acc + t.unread, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {threads.filter((t) => t.category === "autorizacao" && t.unread > 0).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Respondidas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {threads.filter((t) => t.messages.some((m) => m.from === "parent")).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Conversas</CardTitle>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar mensagens..."
                      className="pl-10 border-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)}>
                    <SelectTrigger className="w-full border-2">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filtrar por categoria" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => {
                        const Icon = category.icon
                        const count = category.id === "all"
                          ? threads.length
                          : threads.filter((t) => t.category === category.id).length
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center justify-between w-full gap-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-md ${category.bg} flex items-center justify-center`}>
                                  <Icon className={`h-3 w-3 ${category.color}`} />
                                </div>
                                <span className="font-medium">{category.label}</span>
                              </div>
                              <Badge variant="secondary" className="ml-auto">{count}</Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <Separator />
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-2">
                  {filteredThreads.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Nenhuma mensagem encontrada</p>
                    </div>
                  ) : (
                    filteredThreads.map((thread) => {
                      const categoryInfo = getCategoryInfo(thread.category)
                      const Icon = categoryInfo.icon
                      const isActive = selectedThread === thread.id

                      return (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedThread(thread.id)}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${isActive
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md"
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-lg ${categoryInfo.bg} flex items-center justify-center shrink-0`}>
                              <Icon className={`h-5 w-5 ${categoryInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className={`font-semibold text-sm truncate ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                                  {thread.subject}
                                </h4>
                                {thread.unread > 0 && (
                                  <Badge className="bg-red-500 text-white shrink-0">
                                    {thread.unread}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-2">
                                {thread.lastMessage}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-xs ${categoryInfo.color} ${categoryInfo.border}`}>
                                  {categoryInfo.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {thread.timestamp.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                </span>
                              </div>
                            </div>
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
            {selectedThread && activeThread ? (
              <Card className="border-0 shadow-xl h-[744px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                          ES
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{activeThread.subject}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activeThread.timestamp.toLocaleString("pt-BR")}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedThread(null)}
                      className="lg:hidden"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {activeThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.from === "parent" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 shadow-md ${message.from === "parent"
                            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                            : "bg-white border-2 border-gray-100 rounded-tl-sm"
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((att, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 p-2 rounded-lg ${message.from === "parent" ? "bg-white/20" : "bg-gray-50"
                                    }`}
                                >
                                  {att.type === "image" ? (
                                    <ImageIcon className="h-4 w-4" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                  <span className="text-xs font-medium truncate">{att.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div
                            className={`flex items-center justify-end gap-1 mt-2 text-xs ${message.from === "parent" ? "text-white/80" : "text-muted-foreground"
                              }`}
                          >
                            <span>{message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            {message.from === "parent" && <CheckCheck className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                <div className="p-4">
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        placeholder="Digite sua mensagem..."
                        className="border-2 resize-none"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendReply()
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shrink-0"
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
                  <p className="text-lg font-medium">Selecione uma conversa</p>
                  <p className="text-sm">Escolha uma mensagem à esquerda para visualizar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
