import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSchoolTeachers } from "@/lib/queries/teachers"
import { TeachersPage } from "@/components/teachers"
import type { TeachersConfig } from "@/components/teachers"

const config: TeachersConfig = {
  role: "secretary",
  pageTitle: "Professores",
  pageDescription: "Gerencie os professores da escola e seus vínculos com turmas.",
  basePath: "/secretary/teachers",
  canCreate: true,
  canImport: true,
  canSelect: true,
  canEdit: true,
  showStats: true,
}

export default async function SecretaryTeachersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.schoolId) {
    redirect("/login")
  }

  const teachers = await getSchoolTeachers(session.user.schoolId)

  return <TeachersPage config={config} initialTeachers={teachers} />
}
