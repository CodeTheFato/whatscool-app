import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SchoolFormValues } from "@/lib/validations/school"
import { SCHOOL_TYPES } from "../constants"

interface BasicInfoStepProps {
  form: UseFormReturn<SchoolFormValues>
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome da Escola <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ex: Colégio Bosque Azul"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            {...form.register("cnpj")}
          />
          {form.formState.errors.cnpj && (
            <p className="text-sm text-red-500">
              {form.formState.errors.cnpj.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolType">Tipo de Instituição</Label>
          <Select
            value={form.watch("schoolType")}
            onValueChange={(value) => form.setValue("schoolType", value)}
          >
            <SelectTrigger id="schoolType">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentCount">Número Estimado de Alunos</Label>
        <Input
          id="studentCount"
          placeholder="Ex: 500"
          {...form.register("studentCount")}
        />
        <p className="text-xs text-muted-foreground">
          Este valor pode ser atualizado posteriormente
        </p>
      </div>
    </div>
  )
}
