import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCheck, Clock, Eye, Loader2, Users } from "lucide-react"
import type { AnnouncementItem, CategoryInfo, RecipientDetail } from "./types"

interface AnnouncementRecipientsPanelProps {
  announcement: AnnouncementItem
  categoryInfo: CategoryInfo
  recipients: RecipientDetail[] | null
  isLoading: boolean
}

export default function AnnouncementRecipientsPanel({
  announcement,
  categoryInfo: catInfo,
  recipients,
  isLoading,
}: AnnouncementRecipientsPanelProps) {
  const CatIcon = catInfo.icon

  const totalRecipients = recipients?.length ?? 0
  const totalRead = recipients?.filter((r) => r.readAt !== null).length ?? 0
  const totalConfirmed = recipients?.filter((r) => r.confirmedAt !== null).length ?? 0

  const getStatusInfo = (r: RecipientDetail) => {
    if (r.confirmedAt) {
      return {
        label: "Confirmou",
        color: "text-green-600",
        bg: "bg-green-100",
        icon: CheckCheck,
        time: r.confirmedAt,
      }
    }
    if (r.readAt) {
      return {
        label: "Visualizou",
        color: "text-blue-600",
        bg: "bg-blue-100",
        icon: Eye,
        time: r.readAt,
      }
    }
    return {
      label: "Pendente",
      color: "text-gray-400",
      bg: "bg-gray-100",
      icon: Clock,
      time: null,
    }
  }

  return (
    <Card className="border-0 shadow-xl sticky top-8">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${catInfo.bg} flex items-center justify-center`}>
            <CatIcon className={`h-5 w-5 ${catInfo.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {announcement.title || "Sem título"}
            </CardTitle>
            <CardDescription className="text-xs">
              {announcement.creator?.name} &bull;{" "}
              {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString("pt-BR")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Announcement content */}
        <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 mb-4 line-clamp-6">
          {announcement.content}
        </p>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
            <Eye className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-blue-700">{totalRead}/{totalRecipients}</p>
              <p className="text-[10px] text-blue-600">visualizaram</p>
            </div>
          </div>
          {announcement.requiresConfirmation && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
              <CheckCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-700">{totalConfirmed}/{totalRecipients}</p>
                <p className="text-[10px] text-green-600">confirmaram</p>
              </div>
            </div>
          )}
          {!announcement.requiresConfirmation && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-bold text-gray-700">{totalRecipients}</p>
                <p className="text-[10px] text-gray-500">destinatários</p>
              </div>
            </div>
          )}
        </div>

        {/* Recipient list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
          </div>
        ) : recipients && recipients.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Destinatários
            </p>
            {recipients.map((r) => {
              const status = getStatusInfo(r)
              const StatusIcon = status.icon
              return (
                <div
                  key={r.userId}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-full ${status.bg} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className={`text-[11px] ${status.color}`}>
                      {status.label}
                      {status.time && (
                        <> &bull; {new Date(status.time).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}</>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum destinatário encontrado
          </p>
        )}
      </CardContent>
    </Card>
  )
}
