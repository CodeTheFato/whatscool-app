"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
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
  CheckCheck,
  BellRing,
  DollarSign,
  AlertCircle,
  MessagesSquare,
  X,
  Megaphone,
  Lock,
  Unlock,
  Smartphone,
  Copy,
  Trash2,
  Info,
  AlertTriangle,
} from "lucide-react"

// ==================== TYPES ====================
type Category = "comunicados" | "boletos" | "atraso-boletos" | "avisos"
type ModalIntent = "comunicado" | "conversa"

export type ClassData = {
  id: string
  name: string
  parentCount: number
}

export type StudentData = {
  id: string
  name: string
  classId: string | null
  className: string
  parents: {
    id: string
    name: string
  }[]
}

interface NewCommunicationModalProps {
  open: boolean
  onClose: () => void
  classes: ClassData[]
  students: StudentData[]
  isLoadingRecipients: boolean
  onSendAnnouncement: (payload: {
    category: string
    audienceType: string
    classId?: string
    studentId?: string
    title?: string
    content: string
    allowReplies: boolean
    notifyViaWhatsapp: boolean
  }) => Promise<void>
  onCreateConversation: (payload: {
    category: string
    recipientType: "turma" | "aluno"
    classId?: string
    parentUserId?: string
    subject?: string
    message: string
  }) => Promise<void>
}

// ==================== HELPERS ====================
const categoryToEnum = (cat: Category): string => cat.toUpperCase().replace(/-/g, "_")

const categories = [
  { id: "comunicados" as const, label: "Comunicados", icon: BellRing, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "boletos" as const, label: "Boletos", icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
  { id: "atraso-boletos" as const, label: "Atraso de Boletos", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "avisos" as const, label: "Avisos Gerais", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
]

type AiTone = "Aviso" | "Lembrete" | "Evento" | "Financeiro"

const AI_QUICK_PROMPTS: { label: AiTone; prompt: string }[] = [
  { label: "Aviso", prompt: "Crie um aviso claro e direto sobre o seguinte tema:" },
  { label: "Lembrete", prompt: "Crie um lembrete amigável sobre o seguinte tema:" },
  { label: "Evento", prompt: "Crie um comunicado convidando para o seguinte evento:" },
  { label: "Financeiro", prompt: "Crie um comunicado financeiro formal sobre:" },
]

// ==================== COMPONENT ====================
export default function NewCommunicationModal({
  open,
  onClose,
  classes,
  students,
  isLoadingRecipients,
  onSendAnnouncement,
  onCreateConversation,
}: NewCommunicationModalProps) {
  console.log('students', students)
  // Intent selector
  const [intent, setIntent] = useState<ModalIntent>("comunicado")

  // Form fields (shared)
  const [category, setCategory] = useState<Category>("comunicados")
  const [recipientType, setRecipientType] = useState<"turma" | "aluno">("turma")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  // Conversa direta — parent selection
  const [sendToAllParents, setSendToAllParents] = useState<boolean>(true)
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([])

  // Comunicado-only options
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState<boolean>(true)
  const [allowReplies, setAllowReplies] = useState<boolean>(true)

  // AI composer
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const [aiTone, setAiTone] = useState<AiTone | null>(null)
  const [aiDraft, setAiDraft] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setCategory("comunicados")
    setRecipientType("turma")
    setSelectedClass("")
    setSelectedStudent("")
    setSubject("")
    setMessage("")
    setSendToAllParents(true)
    setSelectedParentIds([])
    setSendViaWhatsApp(true)
    setAllowReplies(true)
    setAiOpen(false)
    setAiPrompt("")
    setAiTone(null)
    setAiDraft(null)
    setAiLoading(false)
    setIsSubmitting(false)
  }, [])

  const handleClose = () => {
    resetForm()
    setIntent("comunicado")
    onClose()
  }

  const handleIntentChange = (newIntent: ModalIntent) => {
    resetForm()
    setIntent(newIntent)
  }

  // ===== AI Generation (mock) =====
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    const toneIntro: Record<string, string> = {
      Aviso: "AVISO IMPORTANTE",
      Lembrete: "Lembrete",
      Evento: "Convite para evento",
      Financeiro: "Informação financeira",
    }
    const header = aiTone ? toneIntro[aiTone] : "Comunicado"
    const generated = `${header}\n\nPrezados responsáveis,\n\n${aiPrompt}\n\nContamos com sua compreensão.\n\nAtenciosamente,\nEscola WhatsCool`
    setAiDraft(generated)
    setAiLoading(false)
  }

  const dismissAI = () => {
    setAiOpen(false)
    setAiPrompt("")
    setAiTone(null)
  }

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!isFormValid()) return
    setIsSubmitting(true)

    try {
      if (intent === "comunicado") {
        const audienceTypeMap: Record<string, string> = { turma: "CLASS", aluno: "STUDENT" }
        await onSendAnnouncement({
          category: categoryToEnum(category),
          audienceType: audienceTypeMap[recipientType] || "ALL_SCHOOL",
          classId: recipientType === "turma" && selectedClass ? selectedClass : undefined,
          studentId: recipientType === "aluno" && selectedStudent ? selectedStudent : undefined,
          title: subject || undefined,
          content: message,
          allowReplies,
          notifyViaWhatsapp: sendViaWhatsApp,
        })
      } else {
        await onCreateConversation({
          category: categoryToEnum(category),
          recipientType,
          classId: recipientType === "turma" && selectedClass ? selectedClass : undefined,
          parentUserId:
            recipientType === "aluno" && selectedStudent
              ? (() => {
                const student = students.find((s) => s.id === selectedStudent)
                return student?.parents[0]?.id
              })()
              : undefined,
          subject: subject || undefined,
          message,
        })
      }
      resetForm()
      setIntent("comunicado")
    } catch {
      // errors handled by parent callbacks
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== Helpers =====
  const getRecipientCount = () => {
    if (recipientType === "turma" && selectedClass) {
      const cls = classes.find((c) => c.id === selectedClass)
      return cls ? `${cls.parentCount} responsáveis` : "0 destinatários"
    }
    if (recipientType === "aluno" && selectedStudent) return "1 responsável"
    return "0 destinatários"
  }

  const getMessagePreview = () => {
    if (!message) return "Sua mensagem aparecerá aqui..."
    const footer =
      intent === "comunicado" && allowReplies
        ? "\n\nPara responder, acesse a plataforma WhatsCool — Central de Comunicação."
        : ""
    return message + footer
  }

  // Derived: selected student's parents
  const selectedStudentData = recipientType === "aluno" && selectedStudent
    ? students.find((s) => s.id === selectedStudent)
    : null

  const effectiveParentIds = selectedStudentData
    ? sendToAllParents
      ? selectedStudentData.parents.map((p) => p.id)
      : selectedParentIds
    : []

  const isFormValid = () => {
    if (!message.trim()) return false
    if (intent === "comunicado" && !subject.trim()) return false
    if (recipientType === "turma" && !selectedClass) return false
    if (recipientType === "aluno" && !selectedStudent) return false
    // Conversa direta + aluno + manual selection: at least 1 parent
    if (intent !== "comunicado" && recipientType === "aluno" && selectedStudent && !sendToAllParents && selectedParentIds.length === 0) return false
    return true
  }

  if (!open) return null

  const isComunicado = intent === "comunicado"

  // Banner label for conversa direta
  const conversaBannerLabel = (() => {
    if (isComunicado) return ""
    if (recipientType === "aluno" && selectedStudent && !sendToAllParents && effectiveParentIds.length === 1) {
      return "Conversa privada com responsável"
    }
    return "Conversa interna na plataforma"
  })()

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* ===== HEADER ===== */}
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Nova comunicação</CardTitle>
                <CardDescription className="text-xs">
                  {isComunicado
                    ? "Publicar comunicado no feed e notificar responsáveis"
                    : "Iniciar conversa direta com responsáveis na plataforma WhatsCool"}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Intent Selector (segmented control) */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => handleIntentChange("comunicado")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${isComunicado ? "bg-white shadow-sm text-purple-700" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Megaphone className="h-4 w-4" />
              Comunicado
            </button>
            <button
              onClick={() => handleIntentChange("conversa")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${!isComunicado ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              Conversa direta
            </button>
          </div>

          {/* WhatsApp toggle — only for Comunicado */}
          {isComunicado && (
            <div
              className={`flex items-center justify-between p-3 mt-4 rounded-xl border-2 transition-all ${sendViaWhatsApp ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/50"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${sendViaWhatsApp ? "bg-green-100" : "bg-gray-200"
                    }`}
                >
                  <Smartphone className={`h-4 w-4 ${sendViaWhatsApp ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div className="space-y-0.5">
                  <Label className={`text-sm font-semibold ${sendViaWhatsApp ? "text-green-800" : "text-gray-500"}`}>
                    Notificar via WhatsApp (em breve)
                  </Label>
                  <p className={`text-xs ${sendViaWhatsApp ? "text-green-600" : "text-gray-400"}`}>
                    {sendViaWhatsApp
                      ? "Responsáveis receberão notificação no WhatsApp"
                      : "Somente publicação na plataforma WhatsCool"}
                  </p>
                </div>
              </div>
              <Switch checked={sendViaWhatsApp} onCheckedChange={setSendViaWhatsApp} />
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          <div className={`grid gap-6 ${isComunicado && sendViaWhatsApp ? "lg:grid-cols-5" : ""}`}>
            {/* ===== FORM COLUMN ===== */}
            <div className={isComunicado && sendViaWhatsApp ? "lg:col-span-3" : ""}>
              <div className="space-y-6">
                {/* Info Banner — Conversa direta */}
                {!isComunicado && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-blue-900">{conversaBannerLabel}</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Toda a comunicação ocorrerá apenas dentro da plataforma WhatsCool. Não haverá notificação via WhatsApp.
                      </p>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Categoria{!isComunicado ? " (opcional)" : ""}
                  </Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as Category)}>
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
                </div>

                {/* Recipient type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Destinatário</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRecipientType("turma")
                        setSelectedClass("")
                        setSelectedStudent("")
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${recipientType === "turma"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <School
                        className={`h-5 w-5 mx-auto mb-2 ${recipientType === "turma" ? "text-blue-600" : "text-gray-400"}`}
                      />
                      <span className={`text-sm font-medium ${recipientType === "turma" ? "text-blue-900" : "text-gray-600"}`}>
                        Turma Inteira
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecipientType("aluno")
                        setSelectedClass("")
                        setSelectedStudent("")
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${recipientType === "aluno"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <User
                        className={`h-5 w-5 mx-auto mb-2 ${recipientType === "aluno" ? "text-purple-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${recipientType === "aluno" ? "text-purple-900" : "text-gray-600"}`}
                      >
                        Aluno Específico
                      </span>
                    </button>
                  </div>

                  {/* Class Select */}
                  {recipientType === "turma" && (
                    <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingRecipients}>
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue placeholder={isLoadingRecipients ? "Carregando..." : "Escolha uma turma"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">Nenhuma turma encontrada</div>
                        ) : (
                          classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Student Select */}
                  {recipientType === "aluno" && (
                    <Select
                      value={selectedStudent}
                      onValueChange={(val) => {
                        setSelectedStudent(val)
                        setSendToAllParents(true)
                        const student = students.find((s) => s.id === val)
                        setSelectedParentIds(student ? student.parents.map((p) => p.id) : [])
                      }}
                      disabled={isLoadingRecipients}
                    >
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue placeholder={isLoadingRecipients ? "Carregando..." : "Escolha um aluno"} />
                      </SelectTrigger>
                      <SelectContent>
                        {students.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">Nenhum aluno encontrado</div>
                        ) : (
                          students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <div>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-muted-foreground">{s.className}</div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Recipient count / info */}
                  {recipientType === "turma" &&
                    selectedClass &&
                    (() => {
                      const cls = classes.find((c) => c.id === selectedClass)
                      if (!cls) return null
                      return (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {cls.parentCount} {cls.parentCount === 1 ? "responsável selecionado" : "responsáveis selecionados"}
                          </span>
                        </div>
                      )
                    })()}

                  {/* Parent selection card — Conversa direta + Aluno */}
                  {recipientType === "aluno" && selectedStudent && selectedStudentData && (
                    isComunicado ? (
                      /* Comunicado mode: simple count */
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            {selectedStudentData.parents.length} {selectedStudentData.parents.length === 1 ? "responsável selecionado" : "responsáveis selecionados"}
                          </span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-xs text-purple-600 hover:text-purple-800 underline">Ver nomes</button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {selectedStudentData.parents.map((p) => (
                                  <p key={p.id} className="text-sm">{p.name}</p>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      /* Conversa direta mode: toggle + manual selection */
                      <div className={`rounded-xl border overflow-hidden transition-all ${sendToAllParents ? "border-gray-200 bg-gray-50/30" : "border-purple-200 bg-white"}`}>
                        {/* Toggle: send to all parents */}
                        <div className={`flex items-center justify-between p-4 transition-all ${sendToAllParents ? "bg-gray-50/50" : "bg-purple-50/30"
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${sendToAllParents ? "bg-gray-100" : "bg-purple-100"
                              }`}>
                              <Users className={`h-4 w-4 ${sendToAllParents ? "text-gray-500" : "text-purple-600"}`} />
                            </div>
                            <div className="space-y-0.5">
                              <Label className={`text-sm font-semibold ${sendToAllParents ? "text-gray-700" : "text-purple-800"}`}>
                                Enviar para todos os responsáveis do aluno
                              </Label>
                              <p className={`text-xs ${sendToAllParents ? "text-gray-500" : "text-purple-600"}`}>
                                {sendToAllParents
                                  ? "Por padrão, a conversa inclui todos os responsáveis do aluno."
                                  : "Modo manual — selecione quais responsáveis participam."}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={sendToAllParents}
                            onCheckedChange={(val) => {
                              setSendToAllParents(val)
                              if (val) {
                                setSelectedParentIds(selectedStudentData.parents.map((p) => p.id))
                              }
                            }}
                          />
                        </div>

                        {/* Summary when ON */}
                        {sendToAllParents && (
                          <div className="px-4 pb-4">
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {selectedStudentData.parents.length} {selectedStudentData.parents.length === 1 ? "responsável incluído" : "responsáveis incluídos"}
                                </span>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 underline">Ver nomes</button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      {selectedStudentData.parents.map((p) => (
                                        <p key={p.id} className="text-sm">{p.name}</p>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        )}

                        {/* Checkboxes when OFF */}
                        {!sendToAllParents && (
                          <div className="px-4 pb-4 space-y-3">
                            <Separator />
                            <div className="space-y-2">
                              {selectedStudentData.parents.map((parent) => {
                                const isChecked = selectedParentIds.includes(parent.id)
                                const isExcluded = !isChecked
                                return (
                                  <div key={parent.id} className="space-y-1">
                                    <label
                                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked
                                        ? "border-purple-200 bg-purple-50/50 hover:bg-purple-50"
                                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-100"
                                        }`}
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedParentIds((prev) => [...prev, parent.id])
                                          } else {
                                            setSelectedParentIds((prev) => prev.filter((id) => id !== parent.id))
                                          }
                                        }}
                                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                      />
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${isChecked ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-500"
                                          }`}>
                                          {parent.name.charAt(0)}
                                        </div>
                                        <span className={`text-sm font-medium ${isChecked ? "text-gray-900" : "text-gray-400 line-through"
                                          }`}>
                                          {parent.name}
                                        </span>
                                      </div>
                                    </label>
                                    {isExcluded && (
                                      <div className="flex items-center gap-1.5 pl-3 text-amber-600">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span className="text-[11px]">Este responsável não verá esta conversa.</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* Attention disclaimer */}
                            {selectedParentIds.length > 0 && (
                              <p className="text-[11px] text-gray-500 leading-relaxed">
                                Atenção: apenas os responsáveis selecionados terão acesso a esta conversa.
                              </p>
                            )}

                            {/* Validation: 0 selected */}
                            {selectedParentIds.length === 0 && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                <span className="text-xs font-medium text-amber-700">
                                  Selecione pelo menos um responsável para continuar.
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Subject / Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {isComunicado ? "Título do comunicado (obrigatório)" : "Assunto (opcional)"}
                  </Label>
                  <Input
                    placeholder={isComunicado ? "Ex: Reunião de pais — 25/03" : "Ex: Dúvida sobre atividade"}
                    className="border-2"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Message Composer with AI */}
                <div className="space-y-0">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">Mensagem *</Label>
                    <span className="text-xs text-muted-foreground">{message.length}/1000</span>
                  </div>
                  <div
                    className={`border-2 rounded-xl overflow-hidden transition-all ${aiOpen || aiDraft ? "border-purple-300 ring-2 ring-purple-100" : ""
                      }`}
                  >
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[150px] resize-none border-0 focus-visible:ring-0 rounded-b-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1000}
                    />

                    {/* Action bar */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-t">
                      <div className="flex items-center gap-1.5 overflow-x-auto flex-1 no-scrollbar">
                        {AI_QUICK_PROMPTS.map((qp) => (
                          <button
                            key={qp.label}
                            type="button"
                            onClick={() => {
                              setAiTone(qp.label)
                              setAiPrompt(qp.prompt)
                              setAiOpen(true)
                              setAiDraft(null)
                            }}
                            className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${aiTone === qp.label
                              ? "border-purple-400 bg-purple-100 text-purple-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50"
                              }`}
                          >
                            {qp.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (aiOpen) {
                            dismissAI()
                            setAiDraft(null)
                          } else {
                            setAiOpen(true)
                          }
                        }}
                        className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${aiOpen || aiDraft
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
                          }`}
                        title="Assistente IA"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* AI Prompt Panel (inline, single-line input) */}
                    {aiOpen && !aiDraft && (
                      <div className="px-3 py-3 bg-purple-50/60 border-t border-purple-200 space-y-2">
                        <Label className="text-xs text-purple-700 font-medium">O que você quer comunicar?</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Reunião de pais sexta-feira às 18h..."
                            className="flex-1 h-9 text-sm border-purple-200 bg-white focus-visible:ring-purple-300"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleGenerateAI()
                            }}
                          />
                          <Button
                            size="sm"
                            className="h-9 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={handleGenerateAI}
                            disabled={!aiPrompt.trim() || aiLoading}
                          >
                            {aiLoading ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                Gerar
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-9 px-3 text-gray-500 hover:text-gray-700" onClick={dismissAI}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* AI Draft Preview */}
                    {aiDraft && (
                      <div className="border-t border-purple-200 bg-gradient-to-b from-purple-50/80 to-white">
                        <div className="px-3 py-2 flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-purple-700">Rascunho IA pronto</span>
                        </div>
                        <div className="px-3 pb-2">
                          <div className="p-3 bg-white rounded-lg border border-purple-100 text-sm text-gray-700 whitespace-pre-wrap max-h-[120px] overflow-y-auto leading-relaxed">
                            {aiDraft}
                          </div>
                        </div>
                        <div className="px-3 pb-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() => {
                              setMessage(aiDraft!)
                              setAiDraft(null)
                              dismissAI()
                            }}
                          >
                            Aplicar substituindo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => {
                              setMessage((prev) => (prev ? prev + "\n\n" + aiDraft : aiDraft!))
                              setAiDraft(null)
                              dismissAI()
                            }}
                          >
                            Inserir no final
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => navigator.clipboard.writeText(aiDraft!)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setAiDraft(null)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Descartar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== OPTIONS SECTION — Comunicado only ===== */}
                {isComunicado && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">Opções</Label>

                      {/* Allow replies toggle */}
                      <div
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${allowReplies ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-gray-50/50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center ${allowReplies ? "bg-emerald-100" : "bg-gray-200"
                              }`}
                          >
                            {allowReplies ? (
                              <Unlock className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <Label className={`text-sm font-semibold ${allowReplies ? "text-emerald-800" : "text-gray-500"}`}>
                              Permitir respostas na plataforma
                            </Label>
                            <p className={`text-xs ${allowReplies ? "text-emerald-600" : "text-gray-400"}`}>
                              {allowReplies
                                ? "Pais podem responder; respostas aparecem em Conversas"
                                : "Somente leitura — respostas desativadas"}
                            </p>
                          </div>
                        </div>
                        <Switch checked={allowReplies} onCheckedChange={setAllowReplies} />
                      </div>
                    </div>
                  </>
                )}

                {/* ===== SUMMARY FOOTER ===== */}
                <div className="p-4 bg-gray-50 border rounded-xl space-y-2">
                  <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                    {isComunicado ? <Megaphone className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                    {isComunicado ? "Resumo da publicação" : "Resumo da conversa"}
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {isComunicado ? (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                          Responsáveis verão no feed da plataforma WhatsCool
                        </li>
                        {sendViaWhatsApp && (
                          <li className="flex items-center gap-1.5 text-green-600">
                            <span className="h-1 w-1 rounded-full bg-green-500 flex-shrink-0" />
                            Pais receberão notificação via WhatsApp (em breve)
                          </li>
                        )}
                        {allowReplies ? (
                          <li className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0" />
                            Pais podem responder; respostas aparecem em Conversas
                          </li>
                        ) : (
                          <li className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                            Somente leitura
                          </li>
                        )}
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-blue-400 flex-shrink-0" />
                          {conversaBannerLabel}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-blue-400 flex-shrink-0" />
                          Aparecerá na aba Conversas para você e {effectiveParentIds.length === 1 ? "o responsável" : "os responsáveis"}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                          Comunicação exclusiva na plataforma WhatsCool
                        </li>
                        {recipientType === "aluno" && selectedStudent && !sendToAllParents && (
                          <li className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-purple-400 flex-shrink-0" />
                            {effectiveParentIds.length} de {selectedStudentData?.parents.length ?? 0} responsáveis selecionados
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button
                    className={`flex-1 shadow-lg ${isComunicado
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      }`}
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {isComunicado ? "Publicando..." : "Criando..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {isComunicado ? "Publicar comunicado" : "Iniciar conversa"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* ===== PREVIEW WHATSAPP (only for Comunicado + toggle ON) ===== */}
            {isComunicado && sendViaWhatsApp && (
              <div className="lg:col-span-2">
                <div className="sticky top-0">
                  <p className="text-sm font-medium mb-3 text-muted-foreground">Preview WhatsApp</p>
                  <div className="bg-[#e5ddd5] rounded-xl p-6 min-h-[200px]">
                    <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-md max-w-[90%]">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{getMessagePreview()}</p>
                      <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-3">
                        <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        <CheckCheck className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  {allowReplies && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 p-2">
                      <MessagesSquare className="h-3 w-3" />
                      <span>Chat interno será criado para respostas</span>
                    </div>
                  )}

                  {/* Destinatários summary */}
                  <div className="mt-4 p-3 rounded-lg bg-white/80 border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Destinatários</p>
                    <Badge className="bg-blue-600 text-white">{getRecipientCount()}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
