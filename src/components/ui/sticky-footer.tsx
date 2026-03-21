"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StickyFooterProps {
  cancelPath: string
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  submitLabel: string
  submittingLabel: string
  disabled?: boolean
  extraLeft?: ReactNode
}

export function StickyFooter({
  cancelPath,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  disabled,
  extraLeft,
}: StickyFooterProps) {
  const router = useRouter()

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {extraLeft ?? <div />}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelPath)}
            disabled={disabled ?? isSubmitting}
          >
            Cancelar
          </Button>
          <Button disabled={disabled ?? isSubmitting} onClick={onSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submittingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
