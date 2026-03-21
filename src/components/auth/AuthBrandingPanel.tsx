import { School } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface AuthBrandingPanelProps {
  title: string
  subtitle: string
  features: Feature[]
}

export function AuthBrandingPanel({ title, subtitle, features }: AuthBrandingPanelProps) {
  return (
    <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
      <div>
        <div className="inline-flex items-center gap-2 mb-8">
          <School className="w-8 h-8" />
          <span className="text-2xl font-bold">Whatscool</span>
        </div>
        <h2 className="text-4xl font-bold mb-4 leading-tight">{title}</h2>
        <p className="text-blue-100 text-lg leading-relaxed">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <feature.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{feature.title}</p>
              <p className="text-sm text-blue-100">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
