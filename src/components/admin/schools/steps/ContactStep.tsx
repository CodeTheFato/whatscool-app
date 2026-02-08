import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SchoolFormValues } from "@/lib/validations/school"
import { WHATSAPP_TYPES } from "../constants"
import { Phone } from "lucide-react"

interface ContactStepProps {
  form: UseFormReturn<SchoolFormValues>
}

export function ContactStep({ form }: ContactStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="+55 31 3333-4444"
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            E-mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contato@escola.com.br"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <Phone className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">WhatsApp (Opcional)</h3>
            <p className="text-xs text-muted-foreground">
              Configure o WhatsApp para comunicação rápida
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="+55 31 99999-8888"
              {...form.register("whatsapp")}
            />
            {form.formState.errors.whatsapp && (
              <p className="text-sm text-red-500">
                {form.formState.errors.whatsapp.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappType">Tipo de Conta</Label>
            <Select
              value={form.watch("whatsappType")}
              onValueChange={(value) =>
                form.setValue("whatsappType", value as "personal" | "business")
              }
            >
              <SelectTrigger id="whatsappType">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {WHATSAPP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
