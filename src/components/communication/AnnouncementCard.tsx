import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  Users,
  Eye,
  MessageSquare,
  CheckCheck,
  Lock,
  Unlock,
  Smartphone,
  Monitor,
} from "lucide-react"
import type { AnnouncementItem, CategoryInfo } from "./types"

interface AnnouncementCardProps {
  announcement: AnnouncementItem
  categoryInfo: CategoryInfo
  showStats: boolean
  showReadStatus: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function AnnouncementCard({
  announcement: ann,
  categoryInfo: catInfo,
  showStats,
  showReadStatus,
  isSelected,
  onClick,
}: AnnouncementCardProps) {
  const CatIcon = catInfo.icon

  const getAudienceLabel = () => {
    if (ann.audienceType === "CLASS" && ann.class) return ann.class.name
    if (ann.audienceType === "STUDENT" && ann.student) return ann.student.user.name
    if (ann.audienceType === "ALL_SCHOOL") return "Toda a escola"
    return ""
  }

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
            className={`h-12 w-12 rounded-xl ${catInfo.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
          >
            <CatIcon className={`h-6 w-6 ${catInfo.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={`${catInfo.bg} ${catInfo.color} border-0 text-xs font-medium`}
              >
                {catInfo.label}
              </Badge>

              {showReadStatus && ann.unread && (
                <Badge className="bg-red-500 text-white border-0 text-[10px] animate-pulse">
                  Novo
                </Badge>
              )}

              {ann.allowReplies !== false ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-600 border-0 text-[10px] gap-1 font-medium"
                >
                  <Unlock className="h-2.5 w-2.5" />
                  {showStats ? "Respostas abertas" : "Aceita respostas"}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-400 border-0 text-[10px] gap-1 font-medium"
                >
                  <Lock className="h-2.5 w-2.5" />
                  Respostas bloqueadas
                </Badge>
              )}

              {showStats && ann.totalConversations && ann.totalConversations > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 border-0 text-[10px] gap-1 font-medium"
                >
                  <MessageSquare className="h-3 w-3" />
                  {ann.totalConversations}{" "}
                  {ann.totalConversations === 1
                    ? "responsavel respondeu"
                    : "responsaveis responderam"}
                </Badge>
              )}

              {showStats && ann.requiresConfirmation && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-600 border-0 text-[10px] gap-1 font-medium"
                >
                  <CheckCheck className="h-2.5 w-2.5" />
                  Exige confirmação
                </Badge>
              )}

              {ann.notifyViaWhatsapp ? (
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
              )}

              {showStats && getAudienceLabel() && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {getAudienceLabel()}
                </span>
              )}

              {ann.creator && (
                <span className="text-xs text-muted-foreground">
                  por {ann.creator.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className={`text-base mb-1 group-hover:text-purple-700 transition-colors ${
                showReadStatus && ann.unread
                  ? "font-bold text-gray-900"
                  : "font-semibold text-gray-700"
              }`}
            >
              {ann.title || "Sem titulo"}
            </h3>

            {/* Content preview */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {ann.content}
            </p>

            {/* Footer stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground flex-wrap">
              {showStats && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {ann.totalRecipients} destinatário{ann.totalRecipients !== 1 ? "s" : ""}
                  </span>
                  <span className={`flex items-center gap-1.5 ${(ann.totalRead ?? 0) > 0 ? "text-blue-600" : ""}`}>
                    <Eye className="h-3.5 w-3.5" />
                    {ann.totalRead ?? 0} visualiz{(ann.totalRead ?? 0) !== 1 ? "aram" : "ou"}
                  </span>
                  {ann.requiresConfirmation && (
                    <span className={`flex items-center gap-1.5 ${(ann.totalConfirmed ?? 0) > 0 ? "text-green-600 font-semibold" : ""}`}>
                      <CheckCheck className="h-3.5 w-3.5" />
                      {ann.totalConfirmed ?? 0} confirm{(ann.totalConfirmed ?? 0) !== 1 ? "aram" : "ou"}
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1.5 ${
                      ann.totalConversations && ann.totalConversations > 0
                        ? "text-purple-600 font-semibold"
                        : ""
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {ann.totalConversations} resposta{ann.totalConversations !== 1 ? "s" : ""}
                  </span>
                </>
              )}

              <span className={`flex items-center gap-1.5 ${showStats ? "ml-auto" : ""}`}>
                <Clock className="h-3.5 w-3.5" />
                {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {showReadStatus && ann.confirmedAt && (
                <span className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCheck className="h-3 w-3" />
                  Confirmado
                </span>
              )}
              {showReadStatus && ann.readAt && !ann.confirmedAt && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Eye className="h-3 w-3" />
                  Visualizado
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
