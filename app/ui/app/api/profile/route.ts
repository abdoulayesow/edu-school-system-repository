// app/ui/app/api/profile/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { updateProfile } from "@api/profile/updateProfile";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { name, dateOfBirth, phone, street, city, state, zip, country } = body;

    const updatedUser = await updateProfile({
      userId,
      name,
      dateOfBirth,
      phone,
      address: { street, city, state, zip, country },
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
