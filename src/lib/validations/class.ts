import * as z from "zod"

export const classFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  grade: z.string().min(1, "Série é obrigatória"),
  shift: z.enum(["MORNING", "AFTERNOON", "EVENING", "FULL_TIME"], {
    message: "Turno é obrigatório",
  }),
  academicYear: z.number().min(2000, "Ano letivo inválido").max(2100, "Ano letivo inválido"),
  maxStudents: z.number().min(1, "Máximo de alunos deve ser maior que 0"),
  teacherId: z.string().optional(),
})

export type ClassFormValues = z.infer<typeof classFormSchema>
