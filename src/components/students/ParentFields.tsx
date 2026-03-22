"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const KINSHIP_OPTIONS = [
  "Pai",
  "Mãe",
  "Avô",
  "Avó",
  "Tio(a)",
  "Responsável Legal",
  "Outro",
]

interface ParentFieldsProps {
  prefix: "parent1" | "parent2"
  form: Record<string, string>
  onUpdate: (field: string, value: string) => void
  onUpdatePhone: (field: string, value: string) => void
  onUpdateCPF: (field: string, value: string) => void
  disabled?: boolean
  required?: boolean
}

export function ParentFields({
  prefix,
  form,
  onUpdate,
  onUpdatePhone,
  onUpdateCPF,
  disabled,
  required = false,
}: ParentFieldsProps) {
  const f = (field: string) => `${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}`

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor={f("name")}>
          Nome completo {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={f("name")}
          placeholder="Nome do responsável"
          value={form[f("name")] ?? ""}
          onChange={(e) => onUpdate(f("name"), e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("email")}>
          Email {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={f("email")}
          type="email"
          placeholder="email@exemplo.com"
          value={form[f("email")] ?? ""}
          onChange={(e) => onUpdate(f("email"), e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("phone")}>
          WhatsApp / Telefone {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={f("phone")}
          placeholder="(00) 00000-0000"
          value={form[f("phone")] ?? ""}
          onChange={(e) => onUpdatePhone(f("phone"), e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("kinship")}>
          Parentesco {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={form[f("kinship")] ?? ""}
          onValueChange={(v) => onUpdate(f("kinship"), v)}
          disabled={disabled}
        >
          <SelectTrigger id={f("kinship")}>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {KINSHIP_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("cpf")}>CPF</Label>
        <Input
          id={f("cpf")}
          placeholder="000.000.000-00"
          value={form[f("cpf")] ?? ""}
          onChange={(e) => onUpdateCPF(f("cpf"), e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
