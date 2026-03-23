"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  Users,
  BookOpen,
  CalendarDays,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCheck,
  Eye,
} from "lucide-react"

export interface ActivityItem {
  id: string
  title: string
  description: string
  type: "HOMEWORK" | "EVENT"
  dueDate: string | null
  maxScore?: number | null
  sendToParents: boolean
  notifyWhatsapp?: boolean
  aiGenerated: boolean
  publishedAt: string | null
  createdAt: string
  class?: { id: string; name: string; grade: string } | null
  subject?: { id: string; name: string } | null
  teacherName?: string
  totalRecipients?: number
  readCount?: number
  readAt?: string | null
  unread?: boolean
}

const TYPE_CONFIG = {
  HOMEWORK: {
    label: "Lição de Casa",
    icon: BookOpen,
    bg: "bg-amber-50",
    color: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
  },
  EVENT: {
    label: "Evento",
    icon: CalendarDays,
    bg: "bg-purple-50",
    color: "text-purple-600",
    gradient: "from-purple-500 to-pink-500",
  },
}

interface ActivityCardProps {
  item: ActivityItem
  showStats?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function ActivityCard({ item, showStats, isSelected, onClick }: ActivityCardProps) {
  const config = TYPE_CONFIG[item.type]
  const TypeIcon = config.icon

  const isOverdue =
    item.type === "HOMEWORK" && item.dueDate && new Date(item.dueDate) < new Date()

  return (
    <Card
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${isSelected ? "ring-2 ring-purple-500 shadow-purple-100" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
          >
            <TypeIcon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={`${config.bg} ${config.color} border-0 text-xs font-medium`}
              >
                {config.label}
              </Badge>

              {item.unread && (
                <Badge className="bg-red-500 text-white border-0 text-[10px] animate-pulse">
                  Novo
                </Badge>
              )}

              {item.aiGenerated && (
                <Badge
                  variant="secondary"
                  className="bg-violet-50 text-violet-600 border-0 text-[10px] gap-1 font-medium"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  IA
                </Badge>
              )}

              {isOverdue && (
                <Badge className="bg-red-100 text-red-600 border-0 text-[10px] font-medium">
                  Atrasado
                </Badge>
              )}

              {item.sendToParents && (
                item.notifyWhatsapp ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-600 border-0 text-[10px] gap-1 font-medium"
                  >
                    <Smartphone className="h-2.5 w-2.5" />
                    WhatsApp
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-500 border-0 text-[10px] gap-1 font-medium"
                  >
                    <Monitor className="h-2.5 w-2.5" />
                    Plataforma
                  </Badge>
                )
              )}

              {item.subject && (
                <span className="text-xs text-muted-foreground">{item.subject.name}</span>
              )}
            </div>

            {/* Title */}
            <h3
              className={`text-base mb-1 group-hover:text-purple-700 transition-colors ${
                item.unread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
              }`}
            >
              {item.title}
            </h3>

            {/* Content preview */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground flex-wrap">
              {item.class && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {item.class.name}
                </span>
              )}

              {item.dueDate && (
                <span
                  className={`flex items-center gap-1.5 ${isOverdue ? "text-red-500 font-medium" : ""}`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Entrega:{" "}
                  {new Date(item.dueDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              )}

              {showStats && item.sendToParents && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {item.readCount ?? 0}/{item.totalRecipients ?? 0} leram
                </span>
              )}

              <span className={`flex items-center gap-1.5 ${showStats ? "ml-auto" : ""}`}>
                <Clock className="h-3.5 w-3.5" />
                {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {item.readAt && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCheck className="h-3 w-3" />
                  Lido
                </span>
              )}

              {item.teacherName && (
                <span className="text-xs text-muted-foreground">
                  por {item.teacherName}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
