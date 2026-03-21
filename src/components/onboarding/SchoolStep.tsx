import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone } from "lucide-react"
import type { SchoolFormState } from "./types"

interface SchoolStepProps {
  form: SchoolFormState
  onUpdate: (field: keyof SchoolFormState, value: string) => void
}

export function SchoolStep({ form, onUpdate }: SchoolStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Criar Escola</CardTitle>
        <CardDescription>Preencha as informações básicas da sua instituição</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schoolName">Nome da Escola *</Label>
          <Input
            id="schoolName"
            placeholder="Escola Municipal..."
            value={form.schoolName}
            onChange={(e) => onUpdate("schoolName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => onUpdate("cnpj", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              placeholder="São Paulo"
              value={form.city}
              onChange={(e) => onUpdate("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">UF *</Label>
            <Input
              id="state"
              placeholder="SP"
              maxLength={2}
              value={form.state}
              onChange={(e) => onUpdate("state", e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp da Escola *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="whatsapp"
              placeholder="+55 11 98765-4321"
              className="pl-10"
              value={form.whatsapp}
              onChange={(e) => onUpdate("whatsapp", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </>
  )
}
