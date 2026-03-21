import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getRecipients } from "@/lib/queries/recipients"
import StaffCommunicationClient from "@/components/communication/StaffCommunicationClient"

export default async function SecretaryCommunicationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.schoolId) {
    redirect("/login")
  }

  const { classes, students } = await getRecipients(session.user.schoolId)

  return (
    <StaffCommunicationClient
      role="secretary"
      initialClasses={classes}
      initialStudents={students}
    />
  )
}
