"use client"

import { Input } from "@/components/ui/input"
import { Search, ListFilter } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface FilterChip {
  id: string
  label: string
  icon?: LucideIcon
  count?: number
  /** Tailwind bg class when active, e.g. "bg-purple-100" */
  activeBg: string
  /** Tailwind text class when active, e.g. "text-purple-700" */
  activeColor: string
}

interface FilterBarProps {
  /** Search input value */
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string

  /** Main chip group — first chip is treated as "all" */
  chips: FilterChip[]
  activeChipId: string
  onChipChange: (id: string) => void

  /** Extra toggle chips shown after a separator (e.g. "Não lidos") */
  extraChips?: FilterChip[]
  activeExtraChipIds?: Set<string>
  onExtraChipToggle?: (id: string) => void

  /** Result bar shown when filters are active */
  resultCount?: number
  activeFilterLabel?: string
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

function Chip({
  chip,
  isActive,
  onClick,
}: {
  chip: FilterChip
  isActive: boolean
  onClick: () => void
}) {
  const Icon = chip.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-7 text-xs rounded-full px-3 font-medium transition-colors ${
        isActive
          ? `${chip.activeBg} ${chip.activeColor}`
          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {chip.label}
      {chip.count != null && chip.count > 0 && (
        <span
          className={`inline-flex items-center h-4 px-1 text-[10px] rounded-full font-medium ${
            isActive ? `${chip.activeColor} opacity-70` : "bg-gray-100 text-gray-500"
          }`}
        >
          {chip.count}
        </span>
      )}
    </button>
  )
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  chips,
  activeChipId,
  onChipChange,
  extraChips,
  activeExtraChipIds,
  onExtraChipToggle,
  resultCount,
  activeFilterLabel,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  const defaultChipId = chips[0]?.id

  return (
    <div className="space-y-3">
      {/* Card wrapper */}
      <div className="rounded-xl border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10 border-2 h-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Chips row */}
        <div className="flex items-center gap-2 flex-wrap">
          <ListFilter className="h-4 w-4 text-muted-foreground flex-shrink-0" />

          {chips.map((chip) => (
            <Chip
              key={chip.id}
              chip={chip}
              isActive={activeChipId === chip.id}
              onClick={() =>
                onChipChange(activeChipId === chip.id ? defaultChipId : chip.id)
              }
            />
          ))}

          {/* Extra chips after separator */}
          {extraChips && extraChips.length > 0 && onExtraChipToggle && (
            <>
              <div className="h-5 w-px bg-gray-200 mx-1" />
              {extraChips.map((chip) => (
                <Chip
                  key={chip.id}
                  chip={chip}
                  isActive={activeExtraChipIds?.has(chip.id) ?? false}
                  onClick={() => onExtraChipToggle(chip.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Result count bar */}
      {hasActiveFilters && resultCount != null && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
            {activeFilterLabel && (
              <>
                {" "}em{" "}
                <span className="font-medium text-foreground">{activeFilterLabel}</span>
              </>
            )}
          </p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
