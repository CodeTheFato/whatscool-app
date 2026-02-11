"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, Users, User, School, MessageSquare, Clock, CheckCheck, Zap, Wand2, TrendingUp } from "lucide-react"
import { toast } from "sonner"

export default function ComunicadosPage() {
  const [abaAtiva, setAbaAtiva] = useState<string>("enviar")
  const [destinatarioTipo, setDestinatarioTipo] = useState<string>("turma")
  const [turma, setTurma] = useState<string>("")
  const [aluno, setAluno] = useState<string>("")
  const [professor, setProfessor] = useState<string>("")
  const [mensagem, setMensagem] = useState<string>("")
  const [assunto, setAssunto] = useState<string>("")

  // Estado para a geração com IA
  const [promptIA, setPromptIA] = useState<string>("")
  const [mensagemGerada, setMensagemGerada] = useState<string>("")
  const [gerando, setGerando] = useState(false)

  // Dados mock
  const turmas = [
    { id: "1a", nome: "1º Ano A" },
    { id: "1b", nome: "1º Ano B" },
    { id: "2a", nome: "2º Ano A" },
    { id: "2b", nome: "2º Ano B" },
    { id: "3a", nome: "3º Ano A" },
  ]

  const alunos = [
    { id: "1", nome: "Ana Silva Santos", turma: "1º Ano A" },
    { id: "2", nome: "Carlos Oliveira", turma: "2º Ano A" },
    { id: "3", nome: "Beatriz Costa", turma: "3º Ano A" },
  ]

  const professores = [
    { id: "1", nome: "Prof. João Silva" },
    { id: "2", nome: "Profa. Maria Santos" },
    { id: "3", nome: "Prof. Pedro Costa" },
  ]

  const handleGerarMensagem = async () => {
    setGerando(true)
    // Simulação de geração com IA
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mensagemSimulada = `Prezados responsáveis,\n\nInformamos que ${promptIA}.\n\nPor favor, confirme o recebimento desta mensagem.\n\nAtenciosamente,\nEscola Municipal - Secretaria`

    setMensagemGerada(mensagemSimulada)
    setGerando(false)
  }

  const handleUsarMensagemIA = () => {
    setMensagem(mensagemGerada)
    setAbaAtiva("enviar")
    toast.success("Mensagem inserida com sucesso!", {
      description: "A mensagem foi adicionada ao campo de envio."
    })
  }

  const handleEnviar = () => {
    console.log("Enviando mensagem:", {
      tipo: destinatarioTipo,
      destinatario: destinatarioTipo === "turma" ? turma : destinatarioTipo === "aluno" ? aluno : professor,
      assunto,
      mensagem,
    })

    alert("Mensagem enviada com sucesso via WhatsApp!")
  }

  const getDestinatariosCount = () => {
    if (destinatarioTipo === "turma" && turma) {
      return "342 responsáveis"
    }
    if (destinatarioTipo === "aluno" && aluno) {
      return "1 responsável"
    }
    if (destinatarioTipo === "professor" && professor) {
      return "1 professor"
    }
    return "0 destinatários"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Central de Comunicação
              </h1>
              <p className="text-sm text-muted-foreground">Envie mensagens via WhatsApp de forma rápida e profissional</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mensagens Enviadas Hoje</p>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                  <p className="text-3xl font-bold text-green-600">98%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Geradas com IA</p>
                  <p className="text-3xl font-bold text-purple-600">8</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
            <TabsTrigger value="enviar" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              <Send className="h-4 w-4" />
              Enviar Mensagem
            </TabsTrigger>
            <TabsTrigger value="ia" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              <Sparkles className="h-4 w-4" />
              Gerar com IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enviar" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 space-y-6">
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Destinatários</CardTitle>
                        <CardDescription>Selecione quem receberá a mensagem</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Tipo de Destinatário</Label>
                      <Select value={destinatarioTipo} onValueChange={setDestinatarioTipo}>
                        <SelectTrigger className="h-12 border-2 hover:border-blue-400 transition-colors">
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
                          <SelectItem value="professor" className="h-12">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <School className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="font-medium">Professor</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {destinatarioTipo === "turma" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-semibold">Selecionar Turma</Label>
                        <Select value={turma} onValueChange={setTurma}>
                          <SelectTrigger className="h-12 border-2 hover:border-blue-400 transition-colors">
                            <SelectValue placeholder="Escolha uma turma" />
                          </SelectTrigger>
                          <SelectContent>
                            {turmas.map((t) => (
                              <SelectItem key={t.id} value={t.id} className="h-10">
                                <span className="font-medium">{t.nome}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {destinatarioTipo === "aluno" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-semibold">Selecionar Aluno</Label>
                        <Select value={aluno} onValueChange={setAluno}>
                          <SelectTrigger className="h-12 border-2 hover:border-blue-400 transition-colors">
                            <SelectValue placeholder="Escolha um aluno" />
                          </SelectTrigger>
                          <SelectContent>
                            {alunos.map((a) => (
                              <SelectItem key={a.id} value={a.id} className="h-14">
                                <div>
                                  <div className="font-medium">{a.nome}</div>
                                  <div className="text-xs text-muted-foreground">{a.turma}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {destinatarioTipo === "professor" && (
                      <div className="space-y-3 animate-in fade-in-from-top-2 duration-300">
                        <Label className="text-sm font-semibold">Selecionar Professor</Label>
                        <Select value={professor} onValueChange={setProfessor}>
                          <SelectTrigger className="h-12 border-2 hover:border-blue-400 transition-colors">
                            <SelectValue placeholder="Escolha um professor" />
                          </SelectTrigger>
                          <SelectContent>
                            {professores.map((p) => (
                              <SelectItem key={p.id} value={p.id} className="h-10">
                                <span className="font-medium">{p.nome}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="pt-4 border-t-2">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">Destinatários selecionados</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1 text-sm font-bold shadow-md">
                          {getDestinatariosCount()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Mensagem</CardTitle>
                        <CardDescription>Escreva o conteúdo da sua comunicação</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Assunto</Label>
                      <Input
                        placeholder="Ex: Reunião de Pais e Mestres"
                        className="h-12 border-2 hover:border-blue-400 transition-colors"
                        value={assunto}
                        onChange={(e) => setAssunto(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center justify-between">
                        <span>Texto da Mensagem</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {mensagem.length} / 1000 caracteres
                        </span>
                      </Label>
                      <Textarea
                        placeholder="Digite sua mensagem aqui... Seja claro e objetivo para melhor comunicação."
                        className="min-h-[220px] resize-none border-2 hover:border-blue-400 transition-colors"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        maxLength={1000}
                      />
                    </div>

                    <Button
                      className="w-full h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleEnviar}
                      disabled={!mensagem || (!turma && !aluno && !professor)}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Enviar via WhatsApp Agora
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="sticky top-6 border-0 shadow-xl overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Preview WhatsApp</CardTitle>
                          <CardDescription>Visualize como ficará</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        Pré-visualização
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-[#e5ddd5] p-6 min-h-[500px]">
                      <div className="space-y-2">
                        <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-md max-w-[85%] animate-in slide-in-from-left-2 duration-300">
                          {assunto && (
                            <div className="font-bold text-base mb-2 text-gray-900 border-b pb-2">
                              {assunto}
                            </div>
                          )}
                          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {mensagem || (
                              <span className="text-gray-400 italic">
                                Sua mensagem aparecerá aqui...
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-3">
                            <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Entrega instantânea via WhatsApp Business API</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ia" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Gerador de Mensagens IA</CardTitle>
                          <CardDescription>
                            Tecnologia avançada para criar mensagens profissionais instantaneamente
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Beta
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        O que você deseja comunicar?
                      </Label>
                      <Textarea
                        placeholder="Ex: Informar sobre reunião de pais na próxima sexta-feira às 18h para discutir o desempenho dos alunos e apresentar o novo projeto pedagógico..."
                        className="min-h-[180px] resize-none border-2 hover:border-purple-400 focus:border-purple-500 transition-colors text-base"
                        value={promptIA}
                        onChange={(e) => setPromptIA(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Seja específico para melhores resultados
                      </p>
                    </div>

                    <Button
                      className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleGerarMensagem}
                      disabled={!promptIA || gerando}
                    >
                      {gerando ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                          Gerando mensagem com IA...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-5 w-5" />
                          Gerar Mensagem Profissional
                        </>
                      )}
                    </Button>

                    {mensagemGerada && (
                      <div className="pt-6 border-t-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <CheckCheck className="h-5 w-5 text-green-600" />
                            Mensagem Gerada com Sucesso
                          </Label>
                          <Badge className="bg-green-100 text-green-700 border-0">
                            Pronto
                          </Badge>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200 shadow-inner">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-800">{mensagemGerada}</p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 h-12 border-2 hover:bg-gray-50"
                            onClick={() => { setPromptIA(""); setMensagemGerada("") }}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gerar Nova Mensagem
                          </Button>
                          <Button
                            className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                            onClick={handleUsarMensagemIA}
                          >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Usar Esta Mensagem
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="sticky top-6 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      Dicas para IA
                    </CardTitle>
                    <CardDescription>Obtenha melhores resultados</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                      <div className="flex gap-3 p-3 bg-white rounded-lg border-2 border-amber-100 hover:border-amber-300 transition-colors">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md">
                          1
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900">Seja específico</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Inclua data, hora e local quando relevante para contexto completo
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-3 bg-white rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold shadow-md">
                          2
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900">Defina o tom</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Mencione se deseja algo formal, urgente ou informativo
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-3 bg-white rounded-lg border-2 border-green-100 hover:border-green-300 transition-colors">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-bold shadow-md">
                          3
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900">Ação esperada</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Especifique se precisa de confirmação, comparecimento, etc.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t-2">
                      <p className="text-sm font-bold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        Exemplos de prompts
                      </p>
                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200 text-xs font-medium hover:shadow-md transition-shadow cursor-pointer">
                          "Avisar que haverá aula de reforço de matemática na segunda às 14h"
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200 text-xs font-medium hover:shadow-md transition-shadow cursor-pointer">
                          "Lembrar sobre o prazo de pagamento que vence amanhã"
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-amber-50 p-3 rounded-lg border border-green-200 text-xs font-medium hover:shadow-md transition-shadow cursor-pointer">
                          "Informar sobre evento festivo da escola no sábado"
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
