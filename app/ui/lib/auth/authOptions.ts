/**
 * Re-export authOptions for use in API routes
 *
 * This allows importing from "@/lib/auth/authOptions" instead of the Next.js route
 */
export { authOptions } from "@/app/api/auth/[...nextauth]/route"
