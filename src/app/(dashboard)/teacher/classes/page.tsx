import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTeacherClasses } from "@/lib/queries/classes"
import { ClassesPage } from "@/components/classes"
import type { ClassesConfig } from "@/components/classes"

const config: ClassesConfig = {
  role: "teacher",
  pageTitle: "Minhas Turmas",
  pageDescription: "Visualize as turmas em que você está vinculado",
  canCreate: false,
  canSelect: false,
}

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.schoolId) {
    redirect("/login")
  }

  const classes = await getTeacherClasses(session.user.schoolId, session.user.id)

  return <ClassesPage config={config} initialClasses={classes} />
}
