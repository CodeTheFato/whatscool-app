import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSchoolStudents } from "@/lib/queries/students"
import { StudentsPage } from "@/components/students"
import type { StudentsConfig } from "@/components/students"

const config: StudentsConfig = {
  role: "secretary",
  pageTitle: "Alunos",
  pageDescription: "Gerencie os alunos e responsáveis da escola",
  basePath: "/secretary/students",
  canCreate: true,
  canImport: true,
  canSelect: true,
  canEdit: true,
  showStats: true,
}

export default async function SecretaryStudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.schoolId) {
    redirect("/login")
  }

  const students = await getSchoolStudents(session.user.schoolId)

  return <StudentsPage config={config} initialStudents={students} />
}
