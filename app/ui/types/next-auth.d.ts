import "next-auth"

import type { AppRole } from "@/lib/rbac"
import type { StaffRole, SchoolLevel } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: AppRole
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
    role: AppRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: AppRole
    // Permission system fields
    staffRole?: StaffRole | null
    schoolLevel?: SchoolLevel | null
    staffProfileId?: string | null
  }
}
