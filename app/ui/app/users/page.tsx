import { redirect } from "next/navigation"

/**
 * Legacy route - redirects to the proper admin users page
 * This redirect maintains backward compatibility for any bookmarks or links
 */
export default function UsersPageRedirect() {
  redirect("/admin/users")
}
