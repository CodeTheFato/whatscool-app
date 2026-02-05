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
import { Send, Sparkles, Users, User, School, MessageSquare } from "lucide-react"

export default function ComunicadosPage() {
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
  }

  const handleEnviar = () => {
    console.log("[v0] Enviando mensagem:", {
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
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="enviar" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="enviar" className="gap-2">
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </TabsTrigger>
              <TabsTrigger value="ia" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enviar" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Selecionar Destinatários</CardTitle>
                      <CardDescription>Escolha para quem deseja enviar a mensagem</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo de Destinatário</Label>
                        <Select value={destinatarioTipo} onValueChange={setDestinatarioTipo}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="turma">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Turma Inteira
                              </div>
                            </SelectItem>
                            <SelectItem value="aluno">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Aluno Individual
                              </div>
                            </SelectItem>
                            <SelectItem value="professor">
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4" />
                                Professor
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {destinatarioTipo === "turma" && (
                        <div className="space-y-2">
                          <Label>Selecionar Turma</Label>
                          <Select value={turma} onValueChange={setTurma}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha uma turma" />
                            </SelectTrigger>
                            <SelectContent>
                              {turmas.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {destinatarioTipo === "aluno" && (
                        <div className="space-y-2">
                          <Label>Selecionar Aluno</Label>
                          <Select value={aluno} onValueChange={setAluno}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um aluno" />
                            </SelectTrigger>
                            <SelectContent>
                              {alunos.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
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
                        <div className="space-y-2">
                          <Label>Selecionar Professor</Label>
                          <Select value={professor} onValueChange={setProfessor}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um professor" />
                            </SelectTrigger>
                            <SelectContent>
                              {professores.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Destinatários selecionados:</span>
                          <Badge variant="secondary">{getDestinatariosCount()}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Mensagem</CardTitle>
                      <CardDescription>Digite a mensagem que deseja enviar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Assunto</Label>
                        <Input
                          placeholder="Ex: Reunião de Pais"
                          value={assunto}
                          onChange={(e) => setAssunto(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Texto da Mensagem</Label>
                        <Textarea
                          placeholder="Digite sua mensagem aqui..."
                          className="min-h-[200px] resize-none"
                          value={mensagem}
                          onChange={(e) => setMensagem(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground text-right">{mensagem.length} caracteres</p>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleEnviar}
                        disabled={!mensagem || (!turma && !aluno && !professor)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar via WhatsApp
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        Preview WhatsApp
                      </CardTitle>
                      <CardDescription>Veja como sua mensagem aparecerá</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-[#e5ddd5] p-4 rounded-lg min-h-[400px]">
                        <div className="bg-white rounded-lg p-4 shadow-sm max-w-[85%]">
                          {assunto && <div className="font-semibold text-sm mb-2 text-gray-900">{assunto}</div>}
                          <div className="text-sm text-gray-800 whitespace-pre-wrap">
                            {mensagem || "Sua mensagem aparecerá aqui..."}
                          </div>
                          <div className="text-xs text-gray-500 text-right mt-2">
                            {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ia" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Gerar Mensagem com IA
                      </CardTitle>
                      <CardDescription>
                        Descreva o que você deseja comunicar e a IA irá gerar uma mensagem profissional
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>O que você deseja comunicar?</Label>
                        <Textarea
                          placeholder="Ex: Informar sobre reunião de pais na próxima sexta-feira às 18h para discutir o desempenho dos alunos"
                          className="min-h-[150px] resize-none"
                          value={promptIA}
                          onChange={(e) => setPromptIA(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleGerarMensagem}
                        disabled={!promptIA || gerando}
                      >
                        {gerando ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Gerando mensagem...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gerar Mensagem
                          </>
                        )}
                      </Button>

                      {mensagemGerada && (
                        <div className="pt-4 border-t space-y-3">
                          <Label>Mensagem Gerada</Label>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{mensagemGerada}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPromptIA("")}>
                              Gerar Novamente
                            </Button>
                            <Button size="sm" onClick={handleUsarMensagemIA} className="flex-1">
                              Usar esta Mensagem
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle>Dicas para IA</CardTitle>
                      <CardDescription>Como obter melhores resultados</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            1
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Seja específico</p>
                            <p className="text-xs text-muted-foreground">Inclua data, hora e local quando relevante</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            2
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Defina o tom</p>
                            <p className="text-xs text-muted-foreground">
                              Mencione se deseja algo formal, urgente ou informativo
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            3
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Inclua ação esperada</p>
                            <p className="text-xs text-muted-foreground">
                              Diga se precisa de confirmação, comparecimento, etc.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground font-medium mb-2">Exemplos de prompts:</p>
                        <div className="space-y-2">
                          <div className="bg-muted p-2 rounded text-xs">
                            "Avisar que haverá aula de reforço de matemática na segunda às 14h"
                          </div>
                          <div className="bg-muted p-2 rounded text-xs">
                            "Lembrar sobre o prazo de pagamento que vence amanhã"
                          </div>
                          <div className="bg-muted p-2 rounded text-xs">
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
        </main>
      </div>
    </div>
  )
}
