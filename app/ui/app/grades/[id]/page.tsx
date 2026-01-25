import { redirect } from "next/navigation"

export default function GradeDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/students/grades`)
}
