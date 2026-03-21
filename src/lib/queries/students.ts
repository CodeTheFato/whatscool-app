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
    parents: student.parents.map((parent: any) => ({
      id: parent.id,
      name: parent.user.name,
      email: parent.user.email,
      phone: parent.user.phone,
      kinship: parent.kinship,
      isActive: parent.user.isActive,
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
  parents: {
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
