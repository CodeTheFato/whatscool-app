import { z } from "zod"

// Schema alinhado com o Prisma Schema School model
export const schoolFormSchema = z.object({
  // Informações Básicas - Step 1
  name: z.string().min(3, "Nome da escola deve ter no mínimo 3 caracteres"),
  cnpj: z.string().optional(),
  schoolType: z.string().optional(),
  studentCount: z.string().optional(),

  // Endereço - Step 2
  address: z.string().optional(),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  zipCode: z.string().optional(),

  // Contato - Step 3
  phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().optional(),
  whatsappType: z.enum(["personal", "business"]).optional(),

  // Configurações - Step 4
  timezone: z.string().min(1, "Timezone é obrigatório"),
  logo: z.string().optional(),
})

export type SchoolFormValues = z.infer<typeof schoolFormSchema>
