import * as z from "zod"

const parentSchema = z.object({
  name: z.string().min(3, "Nome do responsável é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  kinship: z.string().min(1, "Parentesco é obrigatório"),
})

const optionalParentSchema = z.object({
  name: z.string().min(3, "Nome do responsável é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  kinship: z.string().min(1, "Parentesco é obrigatório"),
}).optional().nullable()

export const studentFormSchema = z.object({
  // Dados do aluno
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  registrationId: z.string().min(1, "Matrícula é obrigatória"),
  dateOfBirth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, "Data de nascimento inválida")
    .refine((date) => {
      if (!date) return true
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

// ─── Update schema (edit mode) ─────────────────────────
// Same shape but dateOfBirth is optional for partial updates
const updateParentSchema = z.object({
  id: z.string().optional(), // existing parent ID
  name: z.string().min(3, "Nome do responsável é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  kinship: z.string().min(1, "Parentesco é obrigatório"),
})

export const studentUpdateSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  registrationId: z.string().min(1, "Matrícula é obrigatória"),
  dateOfBirth: z.string().optional(),
  cpf: z.string().optional(),
  healthInfo: z.string().optional(),
  observations: z.string().optional(),
  classId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "TRANSFERRED", "GRADUATED"]).optional(),

  // Parents
  guardian1: updateParentSchema,
  guardian2: updateParentSchema.optional().nullable(),
})

export type StudentUpdateValues = z.infer<typeof studentUpdateSchema>
