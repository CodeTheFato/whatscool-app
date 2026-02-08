import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SchoolFormValues } from "@/lib/validations/school"
import { ESTADOS_BRASILEIROS } from "../constants"

interface AddressStepProps {
  form: UseFormReturn<SchoolFormValues>
}

export function AddressStep({ form }: AddressStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <Label htmlFor="address">Endereço Completo</Label>
        <Input
          id="address"
          placeholder="Rua, Avenida, número, complemento..."
          {...form.register("address")}
        />
        {form.formState.errors.address && (
          <p className="text-sm text-red-500">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            Cidade <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            placeholder="Ex: Belo Horizonte"
            {...form.register("city")}
          />
          {form.formState.errors.city && (
            <p className="text-sm text-red-500">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">
            Estado <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.watch("state")}
            onValueChange={(value) =>
              form.setValue("state", value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BRASILEIROS.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  {estado.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.state && (
            <p className="text-sm text-red-500">
              {form.formState.errors.state.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">CEP</Label>
        <Input
          id="zipCode"
          placeholder="00000-000"
          {...form.register("zipCode")}
        />
        {form.formState.errors.zipCode && (
          <p className="text-sm text-red-500">
            {form.formState.errors.zipCode.message}
          </p>
        )}
      </div>
    </div>
  )
}
