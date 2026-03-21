import * as z from "zod"

// ─── Class-teacher assignment (vínculo) ─────────────────
const classTeacherAssignmentSchema = z.object({
  classId: z.string().min(1, "Turma é obrigatória"),
  subjectId: z.string().optional().nullable(),
  role: z.enum(["MAIN", "SUBJECT", "ASSISTANT"]).default("SUBJECT"),
})

// ─── Create schema ──────────────────────────────────────
export const teacherFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true
        return !isNaN(new Date(date).getTime())
      },
      "Data de nascimento inválida"
    ),
  registrationId: z.string().optional(),
  specialization: z.string().optional(),
  internalNotes: z.string().optional(),
  observations: z.string().optional(),

  // Class-teacher assignments (optional – can link later)
  assignments: z.array(classTeacherAssignmentSchema).optional().default([]),
})

export type TeacherFormValues = z.infer<typeof teacherFormSchema>

// ─── Update schema ──────────────────────────────────────
export const teacherUpdateSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  dateOfBirth: z.string().optional(),
  registrationId: z.string().optional(),
  specialization: z.string().optional(),
  internalNotes: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]).optional(),

  // Full replacement of assignments
  assignments: z.array(classTeacherAssignmentSchema).optional(),
})

export type TeacherUpdateValues = z.infer<typeof teacherUpdateSchema>
