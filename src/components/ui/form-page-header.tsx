"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormPageHeaderProps {
  backPath: string
  backLabel: string
  title: string
  description: ReactNode
  statusBadge?: ReactNode
}

export function FormPageHeader({
  backPath,
  backLabel,
  title,
  description,
  statusBadge,
}: FormPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 text-muted-foreground"
        onClick={() => router.push(backPath)}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {backLabel}
      </Button>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {statusBadge}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
