"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// ─── Mock preview data ───────────────────────────────────
const MOCK_PREVIEW = [
  { row: 1, name: "Maria Silva", email: "maria@email.com", registration: "2026001", class: "1ª Série A", parent: "Ana Silva", status: "valid" as const },
  { row: 2, name: "João Santos", email: "joao@email.com", registration: "2026002", class: "1ª Série A", parent: "Carlos Santos", status: "valid" as const },
  { row: 3, name: "Pedro Oliveira", email: "", registration: "2026003", class: "2ª Série B", parent: "Lucia Oliveira", status: "error" as const, error: "Email obrigatório" },
  { row: 4, name: "Ana Costa", email: "ana@email.com", registration: "2026001", class: "1ª Série A", parent: "Roberto Costa", status: "error" as const, error: "Matrícula duplicada" },
  { row: 5, name: "Lucas Pereira", email: "lucas@email.com", registration: "2026005", class: "3ª Série A", parent: "Marta Pereira", status: "valid" as const },
]

type Step = 1 | 2 | 3

export default function ImportStudentsPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const steps = [
    { number: 1, label: "Baixar modelo" },
    { number: 2, label: "Enviar planilha" },
    { number: 3, label: "Revisar e importar" },
  ]

  const validCount = MOCK_PREVIEW.filter((r) => r.status === "valid").length
  const errorCount = MOCK_PREVIEW.filter((r) => r.status === "error").length

  // ── File handling ─────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (!validTypes.includes(f.type) && !f.name.match(/\.(csv|xlsx?)$/i)) {
      toast.error("Formato inválido. Envie um arquivo CSV ou XLSX.")
      return
    }
    setFile(f)
    setCurrentStep(3)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
    },
    [handleFile]
  )

  const handleDownloadTemplate = () => {
    toast.success("Download do modelo iniciado!")
    // TODO: implement actual template download
    setCurrentStep(2)
  }

  const handleImport = async () => {
    setIsProcessing(true)
    // Simulates processing
    await new Promise((r) => setTimeout(r, 1500))
    setIsProcessing(false)
    toast.success(`${validCount} alunos importados com sucesso!`)
    router.push("/secretary/students")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Back + header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 text-muted-foreground"
          onClick={() => router.push("/secretary/students")}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar para alunos
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Importar alunos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importe alunos em lote a partir de uma planilha CSV ou XLSX.
        </p>
      </div>

      {/* ── Steps indicator ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${currentStep >= step.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {currentStep > step.number ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`hidden text-sm sm:inline ${currentStep >= step.number ? "font-medium" : "text-muted-foreground"
                }`}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-px w-8 sm:w-12 ${currentStep > step.number ? "bg-primary" : "bg-border"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* ── Step 1: Download template ──────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Baixe o modelo de planilha</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Use nossa planilha modelo para garantir que os dados estejam no formato correto.
              Ela contém as colunas obrigatórias e exemplos de preenchimento.
            </p>
            <Button className="mt-6" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Baixar modelo (.xlsx)
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/30 p-5">
            <h4 className="text-sm font-medium">Colunas da planilha</h4>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
              {[
                "Nome do aluno *",
                "Email do aluno *",
                "Matrícula *",
                "Turma",
                "Data de nascimento",
                "CPF do aluno",
                "Nome do responsável *",
                "Email do responsável *",
                "Telefone do responsável *",
                "Parentesco *",
                "CPF do responsável",
                "Info. de saúde",
              ].map((col) => (
                <span key={col} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Já tenho a planilha pronta
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Upload file ────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/40"
              }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
          >
            <Upload className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium">
              Arraste e solte sua planilha aqui
            </p>
            <p className="mt-1 text-xs text-muted-foreground">ou</p>
            <label>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <span>Selecionar arquivo</span>
              </Button>
              <input
                type="file"
                className="sr-only"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0])
                }}
              />
            </label>
            <p className="mt-4 text-xs text-muted-foreground">
              Formatos aceitos: CSV, XLS, XLSX — Máx. 5 MB
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
              Voltar
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review & import ────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* File info */}
          {file && (
            <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setFile(null)
                  setCurrentStep(2)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-2xl font-semibold">{MOCK_PREVIEW.length}</p>
              <p className="text-xs text-muted-foreground">Total de linhas</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-2xl font-semibold text-emerald-600">{validCount}</p>
              <p className="text-xs text-muted-foreground">Válidas</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-2xl font-semibold text-destructive">{errorCount}</p>
              <p className="text-xs text-muted-foreground">Com erro</p>
            </div>
          </div>

          {/* Preview table */}
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aluno</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matrícula</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Turma</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Responsável</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PREVIEW.map((row) => (
                    <tr
                      key={row.row}
                      className={`border-b last:border-0 ${row.status === "error" ? "bg-destructive/5" : ""
                        }`}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{row.row}</td>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">
                        {row.email || (
                          <span className="text-destructive text-xs">vazio</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{row.registration}</td>
                      <td className="px-4 py-3">{row.class}</td>
                      <td className="px-4 py-3">{row.parent}</td>
                      <td className="px-4 py-3">
                        {row.status === "valid" ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-100">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Válido
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-normal">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {row.error}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {errorCount > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {errorCount} linha{errorCount > 1 ? "s" : ""} com erro
                </p>
                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                  As linhas com erro serão ignoradas. Apenas as {validCount} linhas válidas serão importadas.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setFile(null)
                setCurrentStep(2)
              }}
            >
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/secretary/students")}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing || validCount === 0}
              >
                {isProcessing ? "Importando..." : `Importar ${validCount} alunos`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
