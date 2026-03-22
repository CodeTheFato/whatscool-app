import { prisma } from "@/lib/prisma"

export const SubjectService = {
  async list(schoolId: string) {
    return prisma.subject.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        description: true,
        workload: true,
      },
      orderBy: { name: "asc" },
    })
  },
}
