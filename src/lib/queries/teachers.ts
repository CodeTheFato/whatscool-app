import { prisma } from "@/lib/prisma"
import type { TeacherRow } from "@/components/teachers/types"

function formatTeacher(teacher: any): TeacherRow {
  const classNames = [
    ...new Set<string>(teacher.classTeachers.map((ct: any) => ct.class.name)),
  ]
  const subjectNames = [
    ...new Set<string>(
      teacher.classTeachers
        .filter((ct: any) => ct.subject)
        .map((ct: any) => ct.subject!.name)
    ),
  ]

  return {
    id: teacher.id,
    name: teacher.user?.name ?? "Professor sem conta",
    email: teacher.user?.email ?? "",
    phone: teacher.user?.phone ?? null,
    registrationId: teacher.registrationId,
    classes: classNames,
    subjects: subjectNames,
    status: teacher.status,
    isActive: teacher.user?.isActive ?? true,
  }
}

const teacherInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
    },
  },
  classTeachers: {
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
  },
}

export async function getSchoolTeachers(schoolId: string): Promise<TeacherRow[]> {
  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    include: teacherInclude,
    orderBy: { createdAt: "desc" },
  })

  return teachers.map(formatTeacher)
}
