import "next-auth"

import type { Role, StaffRole, SchoolLevel } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      name?: string | null
      email?: string | null
      image?: string | null
      // Permission system fields
      staffRole?: StaffRole | null
      schoolLevel?: SchoolLevel | null
      staffProfileId?: string | null
    }
  }

  interface User {
    id: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: Role
    // Permission system fields
    staffRole?: StaffRole | null
    schoolLevel?: SchoolLevel | null
    staffProfileId?: string | null
  }
}
