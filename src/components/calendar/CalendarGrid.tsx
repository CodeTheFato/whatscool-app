"use client"

import { useMemo } from "react"
import { type ActivityItem } from "@/components/activities/ActivityCard"
import { Loader2, ChevronLeft, ChevronRight, BookOpen, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarGridProps {
  currentMonth: Date
  activities: ActivityItem[]
  onDayClick: (date: Date) => void
  onActivityClick: (id: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  isLoading: boolean
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const TYPE_COLORS = {
  HOMEWORK: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
  },
  EVENT: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-l-purple-500",
    dot: "bg-purple-500",
  },
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const start = new Date(firstDay)
  start.setDate(start.getDate() - start.getDay())

  const end = new Date(lastDay)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

function dateKey(d: Date): string {
  return d.toISOString().split("T")[0]
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function CalendarGrid({
  currentMonth,
  activities,
  onDayClick,
  onActivityClick,
  onPrevMonth,
  onNextMonth,
  onToday,
  isLoading,
}: CalendarGridProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const today = new Date()

  const days = useMemo(() => getCalendarDays(year, month), [year, month])

  const activityMap = useMemo(() => {
    const map = new Map<string, ActivityItem[]>()
    for (const a of activities) {
      if (!a.dueDate) continue
      const key = dateKey(new Date(a.dueDate))
      const list = map.get(key) || []
      list.push(a)
      map.set(key, list)
    }
    return map
  }, [activities])

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold text-gray-800 ml-2">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const isCurrentMonth = day.getMonth() === month
              const isToday = isSameDay(day, today)
              const key = dateKey(day)
              const dayActivities = activityMap.get(key) || []
              const maxVisible = 3
              const overflow = dayActivities.length - maxVisible

              return (
                <div
                  key={i}
                  onClick={() => onDayClick(day)}
                  className={`min-h-[100px] md:min-h-[120px] border-b border-r p-1.5 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !isCurrentMonth ? "bg-gray-50/50" : ""
                  } ${isToday ? "bg-amber-50/50 ring-inset ring-2 ring-amber-400" : ""}`}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? "h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center"
                          : isCurrentMonth
                            ? "text-gray-700"
                            : "text-gray-300"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Activity chips - desktop */}
                  <div className="hidden md:flex flex-col gap-0.5">
                    {dayActivities.slice(0, maxVisible).map((a) => {
                      const colors = TYPE_COLORS[a.type] || TYPE_COLORS.HOMEWORK
                      return (
                        <button
                          key={a.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onActivityClick(a.id)
                          }}
                          className={`${colors.bg} ${colors.text} border-l-2 ${colors.border} text-[11px] font-medium px-1.5 py-0.5 rounded-r text-left truncate hover:opacity-80 transition-opacity flex items-center gap-1`}
                        >
                          {a.type === "HOMEWORK" ? (
                            <BookOpen className="h-2.5 w-2.5 flex-shrink-0" />
                          ) : (
                            <CalendarDays className="h-2.5 w-2.5 flex-shrink-0" />
                          )}
                          <span className="truncate">{a.title}</span>
                        </button>
                      )
                    })}
                    {overflow > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium px-1.5">
                        +{overflow} mais
                      </span>
                    )}
                  </div>

                  {/* Activity dots - mobile */}
                  <div className="flex md:hidden gap-1 flex-wrap">
                    {dayActivities.slice(0, 5).map((a) => {
                      const colors = TYPE_COLORS[a.type] || TYPE_COLORS.HOMEWORK
                      return (
                        <button
                          key={a.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onActivityClick(a.id)
                          }}
                          className={`h-2 w-2 rounded-full ${colors.dot}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
