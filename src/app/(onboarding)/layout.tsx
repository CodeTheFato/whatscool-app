"use client"

import type { ReactNode } from "react"
import { School } from "lucide-react"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Whatscool</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
