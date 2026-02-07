import { z } from "zod"

export const schoolFormSchema = z.object({
  // Informações da Escola
  schoolName: z.string().min(3, "Nome da escola deve ter no mínimo 3 caracteres"),
  taxId: z.string().optional(),
  schoolType: z.string().optional(),
  studentCount: z.string().optional(),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),

  // Contato
  mainEmail: z.string().email("E-mail inválido"),
  officePhone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),

  // WhatsApp
  whatsapp: z.string().min(10, "WhatsApp deve ter no mínimo 10 dígitos"),
  whatsappType: z.enum(["personal", "business"]),
  timezone: z.string(),

  // Administrador
  responsibleName: z.string().min(3, "Nome do responsável é obrigatório"),
  role: z.string().optional(),
  loginEmail: z.string().email("E-mail de login inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de uso",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export type SchoolFormValues = z.infer<typeof schoolFormSchema>
