"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CalendarDays, Loader2, Calendar } from "lucide-react"
import AgendaCard, { type AgendaItem } from "./AgendaCard"
import AgendaDetailModal from "./AgendaDetailModal"

export default function ParentAgendaPage() {
  const [activities, setActivities] = useState<AgendaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/parents/agenda")
      if (res.ok) {
        setActivities(await res.json())
      }
    } catch {
      console.error("Erro ao buscar agenda")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleMarkRead = async (activityId: string) => {
    try {
      await fetch(`/api/parents/agenda/${activityId}/read`, { method: "PATCH" })
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId ? { ...a, readAt: new Date().toISOString(), unread: false } : a
        )
      )
    } catch {
      console.error("Erro ao marcar como lido")
    }
  }

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.type === activeTab)

  const unreadCount = activities.filter((a) => a.unread).length

  const counts = {
    all: activities.length,
    HOMEWORK: activities.filter((a) => a.type === "HOMEWORK").length,
    EVENT: activities.filter((a) => a.type === "EVENT").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Agenda Escolar
            </h1>
            <p className="text-sm text-muted-foreground">
              Lições de casa e eventos dos professores
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-2">
                  {unreadCount} novo{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
            <TabsTrigger
              value="all"
              className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-700 data-[state=active]:to-gray-900 data-[state=active]:text-white transition-all"
            >
              Todos
              {counts.all > 0 && (
                <Badge className="bg-gray-200 text-gray-700 border-0 h-5 px-1.5 text-[10px]">
                  {counts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="HOMEWORK"
              className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Lições
            </TabsTrigger>
            <TabsTrigger
              value="EVENT"
              className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma atividade encontrada</p>
                <p className="text-sm mt-1">As atividades enviadas pelos professores aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => (
                  <AgendaCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      if (item.unread) handleMarkRead(item.id)
                      setSelectedId(item.id)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Drawer */}
      <AgendaDetailModal
        activityId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
