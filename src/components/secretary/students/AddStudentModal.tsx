"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { studentFormSchema, type StudentFormValues } from "@/lib/validations/student"

interface AddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudentAdded: () => void
}

interface ClassOption {
  id: string
  name: string
}

export function AddStudentModal({ open, onOpenChange, onStudentAdded }: AddStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      guardian2: undefined,
    },
  })

  const guardian1Kinship = watch("guardian1.kinship")
  const guardian2Kinship = watch("guardian2.kinship")
  const classId = watch("classId")

  useEffect(() => {
    if (open) {
      fetchClasses()
    }
  }, [open])

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true)
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data.map((cls: any) => ({ id: cls.id, name: cls.name })))
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setIsLoadingClasses(false)
    }
  }

  const onSubmit = async (data: StudentFormValues) => {
    try {
      setIsLoading(true)

      // Remove guardian2 se todos os campos estiverem vazios
      const submitData = { ...data }
      if (
        submitData.guardian2 &&
        !submitData.guardian2.name &&
        !submitData.guardian2.email &&
        !submitData.guardian2.phone &&
        !submitData.guardian2.kinship
      ) {
        submitData.guardian2 = undefined
      }

      // Remove classId se estiver vazio (string vazia ou undefined)
      if (!submitData.classId || submitData.classId.trim() === "") {
        submitData.classId = undefined
      }

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cadastrar aluno")
      }

      toast.success("Aluno cadastrado com sucesso!", {
        description: "Emails de ativação foram enviados aos responsáveis.",
      })

      reset()
      onStudentAdded()
    } catch (error) {
      console.error("Error creating student:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar aluno")
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno e dos responsáveis. Emails de ativação serão enviados aos responsáveis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Dados Pessoais</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: João da Silva"
                  {...register("name")}
                  disabled={isLoading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  {...register("email")}
                  disabled={isLoading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  {...register("phone")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  disabled={isLoading}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register("cpf")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationId">
                  Matrícula <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationId"
                  placeholder="Ex: 2024001"
                  {...register("registrationId")}
                  disabled={isLoading}
                  className={errors.registrationId ? "border-red-500" : ""}
                />
                {errors.registrationId && <p className="text-sm text-red-500">{errors.registrationId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Turma</Label>
                <Select
                  value={classId || ""}
                  onValueChange={(value) => setValue("classId", value)}
                  disabled={isLoading || isLoadingClasses}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingClasses ? "Carregando turmas..." : "Selecione uma turma (opcional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Nenhuma turma cadastrada
                      </div>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Responsável 1 (Obrigatório) */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-foreground">Responsável 1 <span className="text-red-500">*</span></h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="guardian1.name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guardian1.name"
                  placeholder="Ex: Maria da Silva"
                  {...register("guardian1.name")}
                  disabled={isLoading}
                  className={errors.guardian1?.name ? "border-red-500" : ""}
                />
                {errors.guardian1?.name && <p className="text-sm text-red-500">{errors.guardian1.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian1.email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guardian1.email"
                  type="email"
                  placeholder="Ex: maria@email.com"
                  {...register("guardian1.email")}
                  disabled={isLoading}
                  className={errors.guardian1?.email ? "border-red-500" : ""}
                />
                {errors.guardian1?.email && <p className="text-sm text-red-500">{errors.guardian1.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian1.phone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guardian1.phone"
                  placeholder="(11) 99999-9999"
                  {...register("guardian1.phone")}
                  disabled={isLoading}
                  className={errors.guardian1?.phone ? "border-red-500" : ""}
                />
                {errors.guardian1?.phone && <p className="text-sm text-red-500">{errors.guardian1.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian1.kinship">
                  Parentesco <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={guardian1Kinship}
                  onValueChange={(value) => setValue("guardian1.kinship", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.guardian1?.kinship ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mãe</SelectItem>
                    <SelectItem value="father">Pai</SelectItem>
                    <SelectItem value="grandmother">Avó</SelectItem>
                    <SelectItem value="grandfather">Avô</SelectItem>
                    <SelectItem value="guardian">Responsável Legal</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.guardian1?.kinship && <p className="text-sm text-red-500">{errors.guardian1.kinship.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian1.cpf">CPF</Label>
                <Input
                  id="guardian1.cpf"
                  placeholder="000.000.000-00"
                  {...register("guardian1.cpf")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Responsável 2 (Opcional) */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-foreground">Responsável 2 <span className="text-muted-foreground text-xs">(Opcional)</span></h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="guardian2.name">Nome Completo</Label>
                <Input
                  id="guardian2.name"
                  placeholder="Ex: João da Silva"
                  {...register("guardian2.name")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian2.email">Email</Label>
                <Input
                  id="guardian2.email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  {...register("guardian2.email")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian2.phone">Telefone</Label>
                <Input
                  id="guardian2.phone"
                  placeholder="(11) 99999-9999"
                  {...register("guardian2.phone")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian2.kinship">Parentesco</Label>
                <Select
                  value={guardian2Kinship}
                  onValueChange={(value) => setValue("guardian2.kinship", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mãe</SelectItem>
                    <SelectItem value="father">Pai</SelectItem>
                    <SelectItem value="grandmother">Avó</SelectItem>
                    <SelectItem value="grandfather">Avô</SelectItem>
                    <SelectItem value="guardian">Responsável Legal</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian2.cpf">CPF</Label>
                <Input
                  id="guardian2.cpf"
                  placeholder="000.000.000-00"
                  {...register("guardian2.cpf")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Informações de Saúde */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-foreground">Informações Adicionais</h3>

            <div className="space-y-2">
              <Label htmlFor="healthInfo">Informações de Saúde</Label>
              <Textarea
                id="healthInfo"
                placeholder="Alergias, medicamentos, condições especiais..."
                {...register("healthInfo")}
                disabled={isLoading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Informações relevantes sobre a saúde do aluno
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Nota:</strong> Os responsáveis receberão emails com links para ativar suas contas e definir suas senhas.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cadastrar Aluno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
