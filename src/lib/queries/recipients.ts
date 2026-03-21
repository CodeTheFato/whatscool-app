import { prisma } from "@/lib/prisma"
import type { ClassData, StudentData } from "@/components/communication/NewCommunicationModal"

export async function getRecipients(schoolId: string): Promise<{
  classes: ClassData[]
  students: StudentData[]
}> {
  const [classes, students] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId },
      include: {
        students: {
          include: {
            parents: {
              include: {
                user: {
                  select: { id: true, isActive: true },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { academicYear: "desc" },
        { grade: "asc" },
        { name: "asc" },
      ],
    }),
    prisma.student.findMany({
      where: { schoolId },
      include: {
        user: {
          select: { id: true, name: true, isActive: true },
        },
        class: {
          select: { id: true, name: true },
        },
        parents: {
          include: {
            user: {
              select: { id: true, name: true, isActive: true },
            },
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    }),
  ])

  const formattedClasses: ClassData[] = classes.map((cls) => {
    const uniqueParentIds = new Set<string>()
    cls.students.forEach((student) => {
      student.parents.forEach((parent) => {
        if (parent.user.isActive) {
          uniqueParentIds.add(parent.user.id)
        }
      })
    })
    return {
      id: cls.id,
      name: cls.name,
      parentCount: uniqueParentIds.size,
    }
  })

  const formattedStudents: StudentData[] = students
    .filter((student) => student.user.isActive)
    .map((student) => ({
      id: student.id,
      name: student.user.name,
      classId: student.class?.id || null,
      className: student.class?.name || "Sem turma",
      parents: student.parents
        .filter((parent) => parent.user.isActive)
        .map((parent) => ({
          id: parent.user.id,
          name: parent.user.name,
        })),
    }))

  return { classes: formattedClasses, students: formattedStudents }
}
