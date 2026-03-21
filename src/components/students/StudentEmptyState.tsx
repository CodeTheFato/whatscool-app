"use client"

import { useRouter } from "next/navigation"
import { Users, Upload, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentEmptyStateProps {
  basePath: string
  canCreate: boolean
  canImport: boolean
}

export function StudentEmptyState({ basePath, canCreate, canImport }: StudentEmptyStateProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <GraduationCap className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {canCreate ? "Nenhum aluno cadastrado" : "Nenhum aluno vinculado"}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {canCreate
          ? "Comece cadastrando alunos individualmente ou importe a partir de uma planilha."
          : "Você ainda não possui alunos vinculados às suas turmas."}
      </p>
      {canCreate && (
        <div className="mt-6 flex items-center gap-3">
          {canImport && (
            <Button variant="outline" onClick={() => router.push(`${basePath}/import`)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar planilha
            </Button>
          )}
          <Button onClick={() => router.push(`${basePath}/novo`)}>
            <Users className="mr-2 h-4 w-4" />
            Adicionar aluno
          </Button>
        </div>
      )}
    </div>
  )
}
