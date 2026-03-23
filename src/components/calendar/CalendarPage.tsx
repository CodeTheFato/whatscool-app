"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CalendarDays, Plus, Calendar } from "lucide-react"
import { type ActivityItem } from "@/components/activities/ActivityCard"
import ActivityForm from "@/components/activities/ActivityForm"
import ActivityDetailModal from "@/components/activities/ActivityDetailModal"
import CalendarGrid from "./CalendarGrid"

function getMonthRange(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  // Extend to cover visible days from adjacent months
  const firstDay = new Date(year, month, 1)
  const start = new Date(firstDay)
  start.setDate(start.getDate() - start.getDay())

  const lastDay = new Date(year, month + 1, 0)
  const end = new Date(lastDay)
  end.setDate(end.getDate() + (6 - end.getDay()))

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  }
}

interface CalendarPageProps {
  readOnly?: boolean
  eventOnly?: boolean
}

export default function CalendarPage({ readOnly = false, eventOnly = false }: CalendarPageProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeTab, setActiveTab] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [initialDate, setInitialDate] = useState<string | undefined>(undefined)

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const { startDate, endDate } = getMonthRange(currentMonth)
      const res = await fetch(`/api/activities?startDate=${startDate}&endDate=${endDate}`)
      if (res.ok) {
        setActivities(await res.json())
      }
    } catch {
      console.error("Erro ao buscar atividades")
    } finally {
      setIsLoading(false)
    }
  }, [currentMonth])

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

  const handleDayClick = (date: Date) => {
    if (readOnly) return
    const dateStr = date.toISOString().split("T")[0]
    setInitialDate(dateStr)
    setShowForm(true)
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Calendário Escolar
              </h1>
              <p className="text-sm text-muted-foreground">
                {readOnly ? "Visualize lições de casa e eventos" : "Visualize e crie lições de casa e eventos"}
              </p>
            </div>
          </div>
          {!readOnly && (
            <Button
              onClick={() => {
                setInitialDate(undefined)
                setShowForm(true)
              }}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              {eventOnly ? "Novo Evento" : "Nova Atividade"}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
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
            <CalendarGrid
              currentMonth={currentMonth}
              activities={filtered}
              onDayClick={handleDayClick}
              onActivityClick={(id) => setSelectedId(id)}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Drawer */}
      {!readOnly && (
        <ActivityForm
          open={showForm}
          onClose={() => {
            setShowForm(false)
            setInitialDate(undefined)
          }}
          onSuccess={() => {
            setShowForm(false)
            setInitialDate(undefined)
            fetchActivities()
          }}
          initialDate={initialDate}
          eventOnly={eventOnly}
        />
      )}

      {/* Detail Drawer */}
      <ActivityDetailModal
        activityId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
