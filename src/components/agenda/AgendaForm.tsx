"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  CalendarDays,
  Smartphone,
  Users,
} from "lucide-react"
import AgendaAIPanel from "./AgendaAIPanel"

interface ClassOption {
  id: string
  name: string
  grade: string
}

interface SubjectOption {
  id: string
  name: string
}

interface AgendaFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AgendaForm({ open, onClose, onSuccess }: AgendaFormProps) {
  const [type, setType] = useState<"HOMEWORK" | "EVENT">("HOMEWORK")
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxScore, setMaxScore] = useState("")
  const [sendToParents, setSendToParents] = useState(false)
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [showAI, setShowAI] = useState(false)

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    async function loadData() {
      setIsLoading(true)
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/subjects"),
        ])
        if (classesRes.ok) {
          const classesData = await classesRes.json()
          setClasses(
            Array.isArray(classesData)
              ? classesData.map((c: { id: string; name: string; grade: string }) => ({
                  id: c.id,
                  name: c.name,
                  grade: c.grade,
                }))
              : []
          )
        }
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json()
          setSubjects(
            Array.isArray(subjectsData)
              ? subjectsData.map((s: { id: string; name: string }) => ({
                  id: s.id,
                  name: s.name,
                }))
              : []
          )
        }
      } catch {
        console.error("Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [open])

  const resetForm = () => {
    setType("HOMEWORK")
    setClassId("")
    setSubjectId("")
    setTitle("")
    setDescription("")
    setDueDate("")
    setMaxScore("")
    setSendToParents(false)
    setNotifyWhatsapp(false)
    setAiGenerated(false)
    setShowAI(false)
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedClass = classes.find((c) => c.id === classId)
  const selectedSubject = subjects.find((s) => s.id === subjectId)

  const handleSubmit = async () => {
    if (!classId) {
      setError("Selecione uma turma")
      return
    }
    if (!title.trim() || title.trim().length < 3) {
      setError("Título deve ter pelo menos 3 caracteres")
      return
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Descrição deve ter pelo menos 10 caracteres")
      return
    }

    setIsSending(true)
    setError("")

    try {
      const response = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          classId,
          subjectId: subjectId || null,
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate || null,
          maxScore: maxScore ? parseFloat(maxScore) : null,
          sendToParents,
          notifyWhatsapp: sendToParents && notifyWhatsapp,
          aiGenerated,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao criar atividade")
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar atividade")
    } finally {
      setIsSending(false)
    }
  }

  const handleAIGenerated = (result: { title: string; description: string }) => {
    setTitle(result.title)
    setDescription(result.description)
    setAiGenerated(true)
    setShowAI(false)
  }

  const TYPE_OPTIONS = [
    { value: "HOMEWORK" as const, label: "Lição de Casa", icon: BookOpen },
    { value: "EVENT" as const, label: "Evento", icon: CalendarDays },
  ]

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-lg">Nova Atividade</SheetTitle>
              <SheetDescription>Crie uma lição ou evento</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="px-6 space-y-5 pb-4">
            {/* Tipo */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                        type === opt.value
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : "border-transparent bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          type === opt.value ? "text-amber-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          type === opt.value ? "text-amber-700" : "text-gray-500"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Turma e Disciplina */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Turma *
                </Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="mt-1.5 h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Disciplina
                </Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="mt-1.5 h-10">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Panel */}
            {type === "HOMEWORK" && (
              <>
                {!showAI ? (
                  <button
                    type="button"
                    onClick={() => setShowAI(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 hover:bg-violet-50 transition-all duration-200 group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-violet-700">Gerar com IA</p>
                      <p className="text-xs text-violet-500">
                        Descreva o tema e a IA cria a lição
                      </p>
                    </div>
                  </button>
                ) : (
                  <AgendaAIPanel
                    subjectName={selectedSubject?.name || ""}
                    gradeName={selectedClass?.grade || ""}
                    onGenerated={handleAIGenerated}
                    onClose={() => setShowAI(false)}
                  />
                )}
              </>
            )}

            {/* Título */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Título *
              </Label>
              <Input
                placeholder="Ex: Exercícios de frações - Capítulo 5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 h-10"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descrição *
              </Label>
              <Textarea
                placeholder="Descreva a atividade com instruções claras..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-1.5 resize-none"
              />
            </div>

            {/* Data e Nota (HOMEWORK) */}
            {type === "HOMEWORK" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Entrega
                  </Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1.5 h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nota máxima
                  </Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="mt-1.5 h-10"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            )}

            {/* Data do evento (EVENT) */}
            {type === "EVENT" && (
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data do evento
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1.5 h-10"
                />
              </div>
            )}

            <Separator />

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Enviar para os pais</p>
                    <p className="text-xs text-muted-foreground">
                      Notificar responsáveis da turma
                    </p>
                  </div>
                </div>
                <Switch checked={sendToParents} onCheckedChange={setSendToParents} />
              </div>

              {sendToParents && (
                <div className="flex items-center justify-between pl-7">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Notificar via WhatsApp</p>
                      <p className="text-xs text-muted-foreground">
                        Enviar mensagem no WhatsApp
                      </p>
                    </div>
                  </div>
                  <Switch checked={notifyWhatsapp} onCheckedChange={setNotifyWhatsapp} />
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <SheetFooter className="border-t px-6 py-4">
          <Button
            onClick={handleSubmit}
            disabled={isSending || isLoading}
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg h-11 text-base font-semibold"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Criar Atividade
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
