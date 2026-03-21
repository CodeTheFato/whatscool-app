import {
  BellRing,
  DollarSign,
  AlertCircle,
  MessageSquare,
} from "lucide-react"
import type { CategoryInfo } from "./types"

export const CATEGORIES: CategoryInfo[] = [
  { id: "COMUNICADOS", label: "Comunicados", icon: BellRing, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "BOLETOS", label: "Boletos", icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
  { id: "ATRASO_BOLETOS", label: "Atraso de Boletos", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "AVISOS", label: "Avisos Gerais", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
]

export function getCategoryInfo(enumVal: string): CategoryInfo {
  return CATEGORIES.find((c) => c.id === enumVal) || CATEGORIES[0]
}
