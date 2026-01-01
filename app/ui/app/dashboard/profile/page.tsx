import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      address: true, // Include the associated address
    },
  });

  if (!user) {
    // This should ideally not happen if the session is valid,
    // but as a fallback, redirect to login or show an error.
    redirect("/login");
  }

  return (
    <PageContainer maxWidth="lg">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name:</p>
            <p className="font-medium">{user.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Date of Birth:</p>
            <p className="font-medium">
              {user.dateOfBirth?.toDateString() || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Phone:</p>
            <p className="font-medium">{user.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Role:</p>
            <p className="font-medium">{user.role || "N/A"}</p>
          </div>
        </div>

        {user.address && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Street:</p>
                <p className="font-medium">{user.address.street || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">City:</p>
                <p className="font-medium">{user.address.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">State:</p>
                <p className="font-medium">{user.address.state || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Zip Code:</p>
                <p className="font-medium">{user.address.zip || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Country:</p>
                <p className="font-medium">{user.address.country || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <ProfileForm user={user} />
      </div>
    </PageContainer>
  );
}