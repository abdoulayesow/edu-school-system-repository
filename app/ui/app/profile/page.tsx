import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./ProfileForm"
import { PageContainer } from "@/components/layout"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      address: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <ProfileForm user={user} />
    </PageContainer>
  )
}
