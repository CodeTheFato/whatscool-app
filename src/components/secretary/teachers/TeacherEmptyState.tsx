"use client"

import { useRouter } from "next/navigation"
import { Users, Upload, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TeacherEmptyState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <GraduationCap className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Nenhum professor cadastrado</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Comece cadastrando professores individualmente ou importe a partir de uma planilha.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/secretary/teachers/import")}>
          <Upload className="mr-2 h-4 w-4" />
          Importar planilha
        </Button>
        <Button onClick={() => router.push("/secretary/teachers/novo")}>
          <Users className="mr-2 h-4 w-4" />
          Adicionar professor
        </Button>
      </div>
    </div>
  )
}
