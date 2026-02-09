import * as z from "zod"

const parentSchema = z.object({
  name: z.string().min(3, "Nome do responsável é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  kinship: z.string().min(1, "Parentesco é obrigatório"),
})

const optionalParentSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  kinship: z.string().optional(),
}).optional()

export const studentFormSchema = z.object({
  // Dados do aluno
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  registrationId: z.string().min(1, "Matrícula é obrigatória"),
  dateOfBirth: z.string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, "Data de nascimento inválida")
    .refine((date) => {
      const parsedDate = new Date(date)
      const today = new Date()
      const minDate = new Date(1900, 0, 1)
      return parsedDate <= today && parsedDate >= minDate
    }, "Data de nascimento deve estar entre 01/01/1900 e hoje"),
  cpf: z.string().optional(),

  // Responsável 1 (obrigatório)
  guardian1: parentSchema,

  // Responsável 2 (opcional)
  guardian2: optionalParentSchema,

  // Endereço (opcional)
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),

  // Informações adicionais
  healthInfo: z.string().optional(),
  classId: z.string().optional(),
})

export type StudentFormValues = z.infer<typeof studentFormSchema>
