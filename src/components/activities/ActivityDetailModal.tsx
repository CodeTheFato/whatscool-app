"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  BookOpen,
  CalendarDays,
  Sparkles,
  Clock,
  Users,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  Smartphone,
  Monitor,
} from "lucide-react"

interface Recipient {
  id: string
  user: { id: string; name: string; role: string }
  status: string
  readAt: string | null
}

interface ActivityDetail {
  id: string
  title: string
  description: string
  type: "HOMEWORK" | "EVENT"
  dueDate: string | null
  maxScore: number | null
  sendToParents: boolean
  notifyWhatsapp?: boolean
  aiGenerated: boolean
  publishedAt: string | null
  createdAt: string
  teacher: { id: string; name: string } | null
  class: { id: string; name: string; grade: string } | null
  subject: { id: string; name: string } | null
  recipients: Recipient[]
}

const TYPE_CONFIG = {
  HOMEWORK: {
    label: "Lição de Casa",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-50",
    gradient: "from-amber-500 to-orange-500",
  },
  EVENT: {
    label: "Evento",
    icon: CalendarDays,
    color: "text-purple-600",
    bg: "bg-purple-50",
    gradient: "from-purple-500 to-pink-500",
  },
}

interface ActivityDetailDrawerProps {
  activityId: string | null
  onClose: () => void
}

export default function ActivityDetailDrawer({ activityId, onClose }: ActivityDetailDrawerProps) {
  const [activity, setActivity] = useState<ActivityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!activityId) {
      setActivity(null)
      return
    }

    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/activities/${activityId}`)
        if (res.ok) {
          setActivity(await res.json())
        }
      } catch {
        console.error("Erro ao carregar atividade")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [activityId])

  const config = activity ? TYPE_CONFIG[activity.type] : TYPE_CONFIG.HOMEWORK
  const TypeIcon = config.icon
  const readCount = activity?.recipients?.filter((r) => r.readAt).length ?? 0
  const totalRecipients = activity?.recipients?.length ?? 0

  const isOverdue =
    activity?.type === "HOMEWORK" &&
    activity.dueDate &&
    new Date(activity.dueDate) < new Date()

  return (
    <Sheet open={!!activityId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : !activity ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Atividade não encontrada
          </div>
        ) : (
          <>
            {/* Header com gradient */}
            <div className={`bg-gradient-to-r ${config.gradient} px-6 pt-6 pb-5`}>
              <SheetHeader className="p-0">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <TypeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-white text-lg leading-tight">
                      {activity.title}
                    </SheetTitle>
                    <SheetDescription className="text-white/70 mt-1">
                      {config.label}
                    </SheetDescription>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activity.aiGenerated && (
                    <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1 backdrop-blur-sm">
                      <Sparkles className="h-2.5 w-2.5" />
                      Gerado com IA
                    </Badge>
                  )}
                  {isOverdue && (
                    <Badge className="bg-red-500/80 text-white border-0 text-[10px] backdrop-blur-sm">
                      Atrasado
                    </Badge>
                  )}
                  {activity.sendToParents && (
                    <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1 backdrop-blur-sm">
                      {activity.notifyWhatsapp ? (
                        <>
                          <Smartphone className="h-2.5 w-2.5" />
                          WhatsApp
                        </>
                      ) : (
                        <>
                          <Monitor className="h-2.5 w-2.5" />
                          Plataforma
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </SheetHeader>
            </div>

            {/* Info cards */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                {activity.class && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                        Turma
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {activity.class.name}
                      </p>
                    </div>
                  </div>
                )}
                {activity.subject && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                        Disciplina
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {activity.subject.name}
                      </p>
                    </div>
                  </div>
                )}
                {activity.dueDate && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <CalendarDays className={`h-4 w-4 ${isOverdue ? "text-red-400" : "text-gray-400"}`} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                        Entrega
                      </p>
                      <p className={`text-sm font-semibold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                        {new Date(activity.dueDate).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                      Criado em
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(activity.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {activity.teacher && (
                <p className="text-xs text-muted-foreground mt-3">
                  Por <span className="font-medium text-gray-600">{activity.teacher.name}</span>
                </p>
              )}
            </div>

            <Separator />

            {/* Descrição */}
            <div className="px-6 py-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Descrição
              </h4>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
                  {activity.description}
                </p>
              </div>
            </div>

            {/* Status de leitura */}
            {totalRecipients > 0 && (
              <>
                <Separator />
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Status de Leitura
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {readCount}/{totalRecipients}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-gray-100 mb-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${totalRecipients > 0 ? (readCount / totalRecipients) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {activity.recipients.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">{r.user.name}</span>
                        {r.readAt ? (
                          <span className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                            <Eye className="h-3.5 w-3.5" />
                            {new Date(r.readAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <EyeOff className="h-3.5 w-3.5" />
                            Pendente
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
