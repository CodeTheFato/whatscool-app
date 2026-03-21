import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSchoolClasses } from "@/lib/queries/classes"
import { ClassesPage } from "@/components/classes"
import type { ClassesConfig } from "@/components/classes"

const config: ClassesConfig = {
  role: "secretary",
  pageTitle: "Turmas",
  pageDescription: "Gerenciar turmas e horários escolares",
  canCreate: true,
  canSelect: true,
}

export default async function SecretaryClassesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.schoolId) {
    redirect("/login")
  }

  const classes = await getSchoolClasses(session.user.schoolId)

  return <ClassesPage config={config} initialClasses={classes} />
}
