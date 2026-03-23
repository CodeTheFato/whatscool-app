import { z } from "zod"

export const agendaFormSchema = z.object({
  type: z.enum(["HOMEWORK", "EVENT"]),
  classId: z.string().min(1, "Turma é obrigatória"),
  subjectId: z.string().optional().nullable(),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  dueDate: z.string().optional().nullable(),
  maxScore: z.number().positive().optional().nullable(),
  sendToParents: z.boolean().default(false),
  notifyWhatsapp: z.boolean().default(false),
  aiGenerated: z.boolean().default(false),
})

export type AgendaFormValues = z.infer<typeof agendaFormSchema>

export const aiGenerateSchema = z.object({
  subject: z.string().min(1, "Disciplina é obrigatória"),
  grade: z.string().min(1, "Série é obrigatória"),
  topic: z.string().min(5, "Descreva o tema com pelo menos 5 caracteres"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  format: z.enum(["EXERCISES", "TEXT", "RESEARCH", "PROJECT"]).optional(),
})

export type AIGenerateValues = z.infer<typeof aiGenerateSchema>
