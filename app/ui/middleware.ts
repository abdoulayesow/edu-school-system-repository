import { withAuth, type NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

import { isRoleAllowedForRoute } from "@/lib/permissions-v2"

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token

    // If authenticated but not authorized, redirect to /unauthorized.
    // (Unauthenticated requests are handled by withAuth via `authorized` + signIn page.)
    if (token) {
      const pathname = req.nextUrl.pathname

      // Users without a staffRole cannot access protected routes
      if (!token.staffRole || !isRoleAllowedForRoute(token.staffRole, pathname)) {
        const url = req.nextUrl.clone()
        url.pathname = "/unauthorized"
        return NextResponse.redirect(url)
      }
    }
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ token }) {
        // Only check authentication here. RBAC redirect is handled above.
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page)
     * - unauthorized (RBAC landing page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|unauthorized).*)",
  ],
}
