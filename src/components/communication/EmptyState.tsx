import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
        <Icon className="h-10 w-10 text-blue-300" />
      </div>
      <p className="text-xl font-bold text-gray-800 mb-2">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">{description}</p>
      {children}
    </div>
  )
}
