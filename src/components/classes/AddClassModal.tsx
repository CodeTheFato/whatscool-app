"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { classFormSchema, type ClassFormValues } from "@/lib/validations/class"

interface AddClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClassAdded: () => void
}

export function AddClassModal({ open, onOpenChange, onClassAdded }: AddClassModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      academicYear: new Date().getFullYear(),
      maxStudents: 30,
    },
  })

  const shift = watch("shift")

  const shiftOptions = [
    { value: "MORNING", label: "Manhã" },
    { value: "AFTERNOON", label: "Tarde" },
    { value: "FULL_TIME", label: "Integral" },
  ]

  const gradeOptions = [
    { value: "Maternal", label: "Maternal" },
    { value: "Jardim I (pré-escola)", label: "Jardim I (pré-escola)" },
    { value: "Jardim II (pré-escola)", label: "Jardim II (pré-escola)" },
    { value: "1º ano do Fundamental", label: "1º ano do Fundamental" },
    { value: "2º ano do Fundamental", label: "2º ano do Fundamental" },
    { value: "3º ano do Fundamental", label: "3º ano do Fundamental" },
    { value: "4º ano do Fundamental", label: "4º ano do Fundamental" },
    { value: "5º ano do Fundamental", label: "5º ano do Fundamental" },
    { value: "6º ano do Fundamental", label: "6º ano do Fundamental" },
    { value: "7º ano do Fundamental", label: "7º ano do Fundamental" },
    { value: "8º ano do Fundamental", label: "8º ano do Fundamental" },
    { value: "9º ano do Fundamental", label: "9º ano do Fundamental" },
    { value: "1º ano do Ensino Médio", label: "1º ano do Ensino Médio" },
    { value: "2º ano do Ensino Médio", label: "2º ano do Ensino Médio" },
    { value: "3º ano do Ensino Médio", label: "3º ano do Ensino Médio" },
  ]

  const onSubmit = async (data: ClassFormValues) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cadastrar turma")
      }

      toast.success("Turma cadastrada com sucesso!")

      reset()
      onClassAdded()
    } catch (error) {
      console.error("Error creating class:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar turma")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Turma</DialogTitle>
          <DialogDescription>
            Preencha os dados da turma. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome da Turma <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: 1ª Série A"
                {...register("name")}
                disabled={isLoading}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">
                Série <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("grade") || ""}
                onValueChange={(value) => setValue("grade", value)}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.grade ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a série" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-sm text-red-500">{errors.grade.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shift">
                Turno <span className="text-red-500">*</span>
              </Label>
              <Select
                value={shift || ""}
                onValueChange={(value) => setValue("shift", value as ClassFormValues["shift"])}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.shift ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  {shiftOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shift && <p className="text-sm text-red-500">{errors.shift.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">
                Ano Letivo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="academicYear"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                {...register("academicYear", { valueAsNumber: true })}
                disabled={isLoading}
                className={errors.academicYear ? "border-red-500" : ""}
              />
              {errors.academicYear && (
                <p className="text-sm text-red-500">{errors.academicYear.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">
              Máximo de Alunos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maxStudents"
              type="number"
              placeholder="30"
              {...register("maxStudents", { valueAsNumber: true })}
              disabled={isLoading}
              className={errors.maxStudents ? "border-red-500" : ""}
            />
            {errors.maxStudents && <p className="text-sm text-red-500">{errors.maxStudents.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Turma"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
