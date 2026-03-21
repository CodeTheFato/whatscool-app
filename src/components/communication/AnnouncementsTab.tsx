import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Megaphone, Plus } from "lucide-react"
import AnnouncementCard from "./AnnouncementCard"
import AnnouncementReplyPanel from "./AnnouncementReplyPanel"
import { CATEGORIES, getCategoryInfo } from "./categories"
import type { AnnouncementItem, CommunicationConfig } from "./types"

interface AnnouncementsTabProps {
  config: CommunicationConfig
  announcements: AnnouncementItem[]
  isLoading: boolean
  selectedAnnouncement: AnnouncementItem | null
  onSelectAnnouncement: (ann: AnnouncementItem | null) => void
  announcementReply: string
  onAnnouncementReplyChange: (text: string) => void
  isSendingAnnouncementReply: boolean
  onSendAnnouncementReply: () => void
  onNewCommunication?: () => void
}

export default function AnnouncementsTab({
  config,
  announcements,
  isLoading,
  selectedAnnouncement,
  onSelectAnnouncement,
  announcementReply,
  onAnnouncementReplyChange,
  isSendingAnnouncementReply,
  onSendAnnouncementReply,
  onNewCommunication,
}: AnnouncementsTabProps) {
  if (isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Carregando comunicados...</p>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="py-20 text-center">
          <div className="h-20 w-20 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-5">
            <Megaphone className="h-10 w-10 text-purple-300" />
          </div>
          <p className="text-xl font-bold text-gray-800 mb-2">
            {config.canCreateAnnouncement
              ? "Nenhum comunicado enviado ainda"
              : "Nenhum comunicado recebido"}
          </p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            {config.canCreateAnnouncement
              ? "Envie seu primeiro comunicado para os responsáveis da escola."
              : "Você será notificado quando a escola enviar um novo comunicado."}
          </p>
          {config.canCreateAnnouncement && onNewCommunication && (
            <Button
              onClick={onNewCommunication}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 px-6"
            >
              <Plus className="h-4 w-4" />
              Criar Comunicado
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const showReplyPanel = config.canReplyToAnnouncement && selectedAnnouncement

  return (
    <div className={showReplyPanel ? "grid grid-cols-1 lg:grid-cols-5 gap-6" : ""}>
      <div className={showReplyPanel ? "lg:col-span-3 space-y-4" : "space-y-4"}>
        {announcements.map((ann) => {
          const catInfo = getCategoryInfo(ann.category)
          return (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              categoryInfo={catInfo}
              showStats={config.showAnnouncementStats}
              showReadStatus={config.showAnnouncementReadStatus}
              isSelected={selectedAnnouncement?.id === ann.id}
              onClick={
                config.canReplyToAnnouncement
                  ? () =>
                      onSelectAnnouncement(
                        selectedAnnouncement?.id === ann.id ? null : ann
                      )
                  : undefined
              }
            />
          )
        })}
      </div>

      {showReplyPanel && (
        <div className="lg:col-span-2">
          <AnnouncementReplyPanel
            announcement={selectedAnnouncement}
            categoryInfo={getCategoryInfo(selectedAnnouncement.category)}
            replyText={announcementReply}
            onReplyTextChange={onAnnouncementReplyChange}
            isSending={isSendingAnnouncementReply}
            onSendReply={onSendAnnouncementReply}
          />
        </div>
      )}
    </div>
  )
}
