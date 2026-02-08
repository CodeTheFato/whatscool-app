import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SchoolFormValues } from "@/lib/validations/school"
import { TIMEZONES } from "../constants"

interface ConfigurationStepProps {
  form: UseFormReturn<SchoolFormValues>
}

export function ConfigurationStep({ form }: ConfigurationStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <Label htmlFor="timezone">
          Fuso Horário <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.watch("timezone")}
          onValueChange={(value) => form.setValue("timezone", value)}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Selecione o fuso horário" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Importante para horários de aulas e relatórios
        </p>
      </div>

      <div className="border-t pt-4 space-y-2">
        <Label htmlFor="logo">URL do Logo (Opcional)</Label>
        <Input
          id="logo"
          type="url"
          placeholder="https://exemplo.com/logo.png"
          {...form.register("logo")}
        />
        <p className="text-xs text-muted-foreground">
          Você pode adicionar o logo da escola posteriormente
        </p>
      </div>

      {/* Resumo dos dados */}
      <div className="border-t pt-4 mt-6">
        <h3 className="font-semibold mb-3 text-sm">Resumo dos Dados</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-medium">{form.watch("name") || "-"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Cidade/Estado:</span>
            <span className="font-medium">
              {form.watch("city") && form.watch("state")
                ? `${form.watch("city")} - ${form.watch("state")}`
                : "-"}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">E-mail:</span>
            <span className="font-medium">{form.watch("email") || "-"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Telefone:</span>
            <span className="font-medium">{form.watch("phone") || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
