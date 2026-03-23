"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CalendarDays, Plus, Loader2, Calendar } from "lucide-react"
import AgendaCard, { type AgendaItem } from "./AgendaCard"
import AgendaForm from "./AgendaForm"
import AgendaDetailModal from "./AgendaDetailModal"

export default function AgendaPage() {
  const [activities, setActivities] = useState<AgendaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/agenda")
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

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.type === activeTab)

  const counts = {
    all: activities.length,
    HOMEWORK: activities.filter((a) => a.type === "HOMEWORK").length,
    EVENT: activities.filter((a) => a.type === "EVENT").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Agenda Escolar
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie lições de casa e eventos
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Nova Atividade
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
            <TabsTrigger
              value="all"
              className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-700 data-[state=active]:to-gray-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
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
              className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Lições
              {counts.HOMEWORK > 0 && (
                <Badge className="bg-amber-200 text-amber-700 border-0 h-5 px-1.5 text-[10px]">
                  {counts.HOMEWORK}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="EVENT"
              className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Eventos
              {counts.EVENT > 0 && (
                <Badge className="bg-purple-200 text-purple-700 border-0 h-5 px-1.5 text-[10px]">
                  {counts.EVENT}
                </Badge>
              )}
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
                <p className="text-sm mt-1">
                  Clique em &quot;Nova Atividade&quot; para criar a primeira
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => (
                  <AgendaCard
                    key={item.id}
                    item={item}
                    showStats
                    isSelected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Drawer */}
      <AgendaForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          fetchActivities()
          }}
        />

      {/* Detail Drawer */}
      <AgendaDetailModal
        activityId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
