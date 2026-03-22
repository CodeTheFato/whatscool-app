import { prisma } from "@/lib/prisma"
import type { ClassItem } from "@/components/classes/types"

export async function getSchoolClasses(schoolId: string): Promise<ClassItem[]> {
  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      academicYear: { select: { year: true } },
      classTeachers: {
        where: { role: "MAIN" },
        take: 1,
        include: {
          teacher: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
      _count: { select: { students: true } },
    },
    orderBy: [
      { academicYear: { year: "desc" } },
      { grade: "asc" },
      { name: "asc" },
    ],
  })

  return classes.map((cls) => {
    const mainTeacher = cls.classTeachers[0]?.teacher ?? null
    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift,
      academicYear: cls.academicYear.year,
      maxStudents: cls.maxStudents,
      currentStudents: cls._count.students,
      teacher: mainTeacher
        ? { id: mainTeacher.id, name: mainTeacher.user?.name ?? "Professor sem conta" }
        : null,
      createdAt: cls.createdAt.toISOString(),
    }
  })
}

export async function getTeacherClasses(schoolId: string, userId: string): Promise<ClassItem[]> {
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

  const classes = await prisma.class.findMany({
    where: { id: { in: classIds }, schoolId },
    include: {
      academicYear: { select: { year: true } },
      classTeachers: {
        where: { role: "MAIN" },
        take: 1,
        include: {
          teacher: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
      _count: { select: { students: true } },
    },
    orderBy: [
      { academicYear: { year: "desc" } },
      { grade: "asc" },
      { name: "asc" },
    ],
  })

  return classes.map((cls) => {
    const mainTeacher = cls.classTeachers[0]?.teacher ?? null
    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift,
      academicYear: cls.academicYear.year,
      maxStudents: cls.maxStudents,
      currentStudents: cls._count.students,
      teacher: mainTeacher
        ? { id: mainTeacher.id, name: mainTeacher.user?.name ?? "Professor sem conta" }
        : null,
      createdAt: cls.createdAt.toISOString(),
    }
  })
}
