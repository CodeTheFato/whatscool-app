import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTeacherStudents } from "@/lib/queries/students"
import { StudentsPage } from "@/components/students"
import type { StudentsConfig } from "@/components/students"

const config: StudentsConfig = {
  role: "teacher",
  pageTitle: "Meus Alunos",
  pageDescription: "Visualize os alunos das turmas em que você leciona",
  basePath: "/teacher/students",
  canCreate: false,
  canImport: false,
  canSelect: false,
  canEdit: false,
  showStats: true,
}

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.schoolId) {
    redirect("/login")
  }

  const students = await getTeacherStudents(session.user.schoolId, session.user.id)

  return <StudentsPage config={config} initialStudents={students} />
}
