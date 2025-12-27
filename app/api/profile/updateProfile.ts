import { prisma } from "@db/prisma"

export type UpdateProfileInput = {
  userId: string
  name?: string | null
  dateOfBirth?: string | null
  phone?: string | null
  address?: {
    street?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
    country?: string | null
  } | null
}

export async function updateProfile(input: UpdateProfileInput) {
  const { userId, name, dateOfBirth, phone, address } = input

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name ?? undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phone: phone ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      dateOfBirth: true,
      phone: true,
    },
  })

  if (address && (address.street || address.city || address.state || address.zip || address.country)) {
    await prisma.address.upsert({
      where: { userId },
      update: {
        street: address.street ?? undefined,
        city: address.city ?? undefined,
        state: address.state ?? undefined,
        zip: address.zip ?? undefined,
        country: address.country ?? undefined,
      },
      create: {
        userId,
        street: address.street ?? null,
        city: address.city ?? null,
        state: address.state ?? null,
        zip: address.zip ?? null,
        country: address.country ?? null,
      },
    })
  }

  return updatedUser
}
