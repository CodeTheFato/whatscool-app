"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, Wand2, X } from "lucide-react"

interface AgendaAIPanelProps {
  subjectName: string
  gradeName: string
  onGenerated: (result: { title: string; description: string }) => void
  onClose: () => void
}

export default function AgendaAIPanel({
  subjectName,
  gradeName,
  onGenerated,
  onClose,
}: AgendaAIPanelProps) {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [format, setFormat] = useState("EXERCISES")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!topic.trim() || topic.trim().length < 5) {
      setError("Descreva o tema com pelo menos 5 caracteres")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/agenda/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectName,
          grade: gradeName,
          topic: topic.trim(),
          difficulty,
          format,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao gerar conteúdo")
      }

      const result = await response.json()
      onGenerated(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar conteúdo com IA")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-700">
            <Sparkles className="h-4 w-4" />
            Gerar com IA
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs text-violet-600">
            Descreva o tema da lição de casa
          </Label>
          <Input
            placeholder="Ex: Frações com denominadores diferentes, soma e subtração"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              setError("")
            }}
            className="mt-1 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-violet-600">Dificuldade</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1 bg-white h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Fácil</SelectItem>
                <SelectItem value="MEDIUM">Médio</SelectItem>
                <SelectItem value="HARD">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-violet-600">Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-1 bg-white h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXERCISES">Exercícios</SelectItem>
                <SelectItem value="TEXT">Produção de Texto</SelectItem>
                <SelectItem value="RESEARCH">Pesquisa</SelectItem>
                <SelectItem value="PROJECT">Projeto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Gerar Lição de Casa
            </>
          )}
        </Button>

        <p className="text-[10px] text-violet-400 text-center">
          Disciplina: {subjectName || "Não selecionada"} | Série: {gradeName || "Não selecionada"}
        </p>
      </CardContent>
    </Card>
  )
}
