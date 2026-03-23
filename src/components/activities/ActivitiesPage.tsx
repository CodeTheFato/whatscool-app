"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { FilterBar, type FilterChip } from "@/components/ui/filter-bar"
import { BookOpen, CalendarDays, Plus, Loader2, Calendar, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ActivityCard, { type ActivityItem } from "./ActivityCard"
import ActivityForm from "./ActivityForm"
import ActivityDetailModal from "./ActivityDetailModal"

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Filter state
  const [search, setSearch] = useState("")
  const [activeType, setActiveType] = useState("ALL")

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/activities")
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

  // Build filter chips
  const chips = useMemo<FilterChip[]>(() => {
    const homeworkCount = activities.filter((a) => a.type === "HOMEWORK").length
    const eventCount = activities.filter((a) => a.type === "EVENT").length

    const result: FilterChip[] = [
      {
        id: "ALL",
        label: "Todos",
        count: activities.length,
        activeBg: "bg-gray-100",
        activeColor: "text-gray-800",
      },
    ]

    if (homeworkCount > 0) {
      result.push({
        id: "HOMEWORK",
        label: "Lições",
        icon: BookOpen,
        count: homeworkCount,
        activeBg: "bg-amber-50",
        activeColor: "text-amber-600",
      })
    }

    if (eventCount > 0) {
      result.push({
        id: "EVENT",
        label: "Eventos",
        icon: CalendarDays,
        count: eventCount,
        activeBg: "bg-purple-50",
        activeColor: "text-purple-600",
      })
    }

    return result
  }, [activities])

  // Filtered list
  const filtered = useMemo(() => {
    let result = activities

    if (activeType !== "ALL") {
      result = result.filter((a) => a.type === activeType)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    }

    return result
  }, [activities, activeType, search])

  const hasActiveFilters = activeType !== "ALL" || search.trim() !== ""
  const activeFilterLabel = activeType !== "ALL"
    ? chips.find((c) => c.id === activeType)?.label
    : undefined

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

        {/* Filters */}
        {!isLoading && activities.length > 0 && (
          <div className="mb-6">
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Buscar por título ou descrição..."
              chips={chips}
              activeChipId={activeType}
              onChipChange={setActiveType}
              hasActiveFilters={hasActiveFilters}
              resultCount={filtered.length}
              activeFilterLabel={activeFilterLabel}
              onClearFilters={() => {
                setSearch("")
                setActiveType("ALL")
              }}
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Nenhuma atividade encontrada</p>
            <p className="text-sm mt-1">
              Clique em &quot;Nova Atividade&quot; para criar a primeira
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                Nenhuma atividade encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou o termo de busca.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                showStats
                isSelected={selectedId === item.id}
                onClick={() => setSelectedId(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Drawer */}
      <ActivityForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          fetchActivities()
        }}
      />

      {/* Detail Drawer */}
      <ActivityDetailModal
        activityId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
