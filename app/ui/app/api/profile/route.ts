// app/ui/app/api/profile/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { name, dateOfBirth, phone, street, city, state, zip, country } = body;

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        phone: phone,
      },
    });

    // Update or create address information
    if (street || city || state || zip || country) {
      await prisma.address.upsert({
        where: { userId: userId },
        update: {
          street: street,
          city: city,
          state: state,
          zip: zip,
          country: country,
        },
        create: {
          userId: userId,
          street: street,
          city: city,
          state: state,
          zip: zip,
          country: country,
        },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
