import { redirect } from "next/navigation"

export default function TrimestersRedirect() {
  redirect("/admin/grades?tab=trimesters")
}
