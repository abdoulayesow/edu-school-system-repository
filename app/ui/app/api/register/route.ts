import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  if (!email || !password) {
    return new NextResponse("Please provide email and password", { status: 400 })
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  })

  if (exists) {
    return new NextResponse("User already exists", { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
    },
  })

  return NextResponse.json(user)
}
