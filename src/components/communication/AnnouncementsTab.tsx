"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FilterBar, type FilterChip } from "@/components/ui/filter-bar"
import { Megaphone, Plus, Search } from "lucide-react"
import AnnouncementCard from "./AnnouncementCard"
import AnnouncementReplyPanel from "./AnnouncementReplyPanel"
import AnnouncementRecipientsPanel from "./AnnouncementRecipientsPanel"
import { CATEGORIES, getCategoryInfo } from "./categories"
import type { AnnouncementItem, CommunicationConfig, RecipientDetail } from "./types"

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
  onConfirm?: (announcementId: string) => void
  isConfirming?: boolean
  recipientDetails?: RecipientDetail[] | null
  isLoadingRecipients?: boolean
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
  onConfirm,
  isConfirming,
  recipientDetails,
  isLoadingRecipients,
}: AnnouncementsTabProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("ALL")
  const [unreadOnly, setUnreadOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = announcements
    if (category !== "ALL") {
      result = result.filter((a) => a.category === category)
    }
    if (unreadOnly) {
      result = result.filter((a) => a.unread)
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(q)) ||
          a.content.toLowerCase().includes(q)
      )
    }
    return result
  }, [announcements, category, unreadOnly, search])

  // Build chips from categories
  const chips = useMemo<FilterChip[]>(() => {
    const allChip: FilterChip = {
      id: "ALL",
      label: "Todos",
      count: announcements.length,
      activeBg: "bg-purple-100",
      activeColor: "text-purple-700",
    }
    const catChips: FilterChip[] = CATEGORIES
      .map((cat) => ({
        id: cat.id,
        label: cat.label,
        icon: cat.icon,
        count: announcements.filter((a) => a.category === cat.id).length,
        activeBg: cat.bg,
        activeColor: cat.color,
      }))
      .filter((c) => c.count > 0)

    return [allChip, ...catChips]
  }, [announcements])

  // Extra chips (unread for parents)
  const extraChips = useMemo<FilterChip[]>(() => {
    if (!config.showAnnouncementReadStatus) return []
    const unreadCount = announcements.filter((a) => a.unread).length
    return [
      {
        id: "UNREAD",
        label: "Não lidos",
        count: unreadCount > 0 ? unreadCount : undefined,
        activeBg: "bg-red-100",
        activeColor: "text-red-600",
      },
    ]
  }, [config.showAnnouncementReadStatus, announcements])

  const activeExtraChipIds = useMemo(
    () => new Set(unreadOnly ? ["UNREAD"] : []),
    [unreadOnly]
  )

  const hasActiveFilters = category !== "ALL" || unreadOnly || search.trim() !== ""
  const activeFilterLabel = category !== "ALL"
    ? CATEGORIES.find((c) => c.id === category)?.label
    : undefined

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
  const showRecipientsPanel = config.showAnnouncementStats && selectedAnnouncement
  const showSidePanel = showReplyPanel || showRecipientsPanel

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título ou conteúdo..."
        chips={chips}
        activeChipId={category}
        onChipChange={setCategory}
        extraChips={extraChips.length > 0 ? extraChips : undefined}
        activeExtraChipIds={activeExtraChipIds}
        onExtraChipToggle={(id) => {
          if (id === "UNREAD") setUnreadOnly((v) => !v)
        }}
        hasActiveFilters={hasActiveFilters}
        resultCount={filtered.length}
        activeFilterLabel={activeFilterLabel}
        onClearFilters={() => {
          setSearch("")
          setCategory("ALL")
          setUnreadOnly(false)
        }}
      />

      {/* Announcements list */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              Nenhum comunicado encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou o termo de busca.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={showSidePanel ? "grid grid-cols-1 lg:grid-cols-5 gap-6" : ""}>
          <div className={showSidePanel ? "lg:col-span-3 space-y-4" : "space-y-4"}>
            {filtered.map((ann) => {
              const catInfo = getCategoryInfo(ann.category)
              return (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  categoryInfo={catInfo}
                  showStats={config.showAnnouncementStats}
                  showReadStatus={config.showAnnouncementReadStatus}
                  isSelected={selectedAnnouncement?.id === ann.id}
                  onClick={() =>
                    onSelectAnnouncement(
                      selectedAnnouncement?.id === ann.id ? null : ann
                    )
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
                onConfirm={onConfirm ? () => onConfirm(selectedAnnouncement.id) : undefined}
                isConfirming={isConfirming}
              />
            </div>
          )}

          {showRecipientsPanel && (
            <div className="lg:col-span-2">
              <AnnouncementRecipientsPanel
                announcement={selectedAnnouncement}
                categoryInfo={getCategoryInfo(selectedAnnouncement.category)}
                recipients={recipientDetails ?? null}
                isLoading={isLoadingRecipients ?? false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
