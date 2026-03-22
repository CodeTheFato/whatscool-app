import { prisma } from "@/lib/prisma"
import type { StudentRow } from "@/components/students/types"

function formatStudent(student: any): StudentRow {
  return {
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    phone: student.user.phone,
    registrationId: student.registrationId,
    class: student.class?.name || null,
    parents: student.studentParents.map((sp: any) => ({
      id: sp.parent.id,
      name: sp.parent.user.name,
      email: sp.parent.user.email,
      phone: sp.parent.user.phone,
      kinship: sp.kinship,
      isActive: sp.parent.user.isActive,
    })),
    status: student.status,
    isActive: student.user.isActive,
    dateOfBirth: student.dateOfBirth?.toISOString(),
    createdAt: student.createdAt?.toISOString(),
  }
}

const studentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
    },
  },
  class: {
    select: {
      id: true,
      name: true,
    },
  },
  studentParents: {
    include: {
      parent: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: { isPrimary: "desc" as const },
  },
}

export async function getSchoolStudents(schoolId: string): Promise<StudentRow[]> {
  const students = await prisma.student.findMany({
    where: { schoolId },
    include: studentInclude,
    orderBy: { createdAt: "desc" },
  })

  return students.map(formatStudent)
}

export async function getTeacherStudents(schoolId: string, userId: string): Promise<StudentRow[]> {
  const teacher = await prisma.teacher.findFirst({
    where: { userId, schoolId },
    select: { id: true },
  })

  if (!teacher) return []

  const classTeachers = await prisma.classTeacher.findMany({
    where: { teacherId: teacher.id, schoolId },
    select: { classId: true },
  })

  const classIds = classTeachers.map((ct) => ct.classId)

  if (classIds.length === 0) return []

  const students = await prisma.student.findMany({
    where: {
      schoolId,
      classId: { in: classIds },
    },
    include: studentInclude,
    orderBy: { createdAt: "desc" },
  })

  return students.map(formatStudent)
}
